const dgram = require('dgram');
const http = require('http');
const os = require('os');

const UDP_PORT = 3334;
const HTTP_PORT = 3333;
const MAGIC = 'CONTROLMESA_DISCOVER';

function ipv4Interfaces() {
  const list = [];
  for (const infos of Object.values(os.networkInterfaces())) {
    for (const i of infos || []) {
      if (i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254.')) list.push(i);
    }
  }
  return list;
}

const toInt = (ip) => ip.split('.').reduce((a, p) => (a << 8) + Number(p), 0) >>> 0;
const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');

function broadcastOf(i) {
  const mask = toInt(i.netmask);
  return toIp(((toInt(i.address) & mask) | ~mask) >>> 0);
}

function validInfo(data) {
  return data && data.app === 'ControlMesa' && data.url ? data : null;
}

/** Confirma que `url` é um backend ControlMesa respondendo. */
function probeUrl(url, timeout = 1500) {
  return new Promise((resolve) => {
    const req = http.get(`${url.replace(/\/$/, '')}/server-info`, { timeout }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(validInfo(JSON.parse(body))); } catch { resolve(null); }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

/** Broadcast UDP em cada interface; o backend responde com seu endereço. */
function discoverUdp(timeout = 2500) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      try { socket.close(); } catch {}
      resolve(value);
    };

    socket.on('message', (msg) => {
      try {
        const info = validInfo(JSON.parse(msg.toString()));
        if (info) finish(info);
      } catch {}
    });
    socket.on('error', () => finish(null));

    socket.bind(0, () => {
      try {
        socket.setBroadcast(true);
        const targets = new Set(['255.255.255.255', ...ipv4Interfaces().map(broadcastOf)]);
        const send = () => {
          if (finished) return;
          targets.forEach((t) => socket.send(MAGIC, UDP_PORT, t, () => {}));
        };
        send();
        setTimeout(send, 700);
        setTimeout(send, 1400);
      } catch {
        finish(null);
      }
    });
    setTimeout(() => finish(null), timeout);
  });
}

/** Plano B (UDP bloqueado): varre a sub-rede /24 de cada interface na porta 3333. */
async function discoverScan() {
  const local = await probeUrl(`http://127.0.0.1:${HTTP_PORT}`, 400);
  if (local) return local;

  const hosts = [];
  for (const i of ipv4Interfaces()) {
    const base = i.address.split('.').slice(0, 3).join('.');
    for (let n = 1; n < 255; n++) if (`${base}.${n}` !== i.address) hosts.push(`${base}.${n}`);
  }
  let found = null;
  let next = 0;
  const worker = async () => {
    while (!found && next < hosts.length) {
      const info = await probeUrl(`http://${hosts[next++]}:${HTTP_PORT}`, 500);
      if (info) found = info;
    }
  };
  await Promise.all(Array.from({ length: 64 }, worker));
  return found;
}

async function discoverServer() {
  return (await discoverUdp()) || (await discoverScan());
}

module.exports = { discoverServer, probeUrl };
