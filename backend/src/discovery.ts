import { createSocket } from "dgram";
import { hostname, networkInterfaces } from "os";

const DISCOVERY_PORT = Number(process.env.DISCOVERY_PORT) || 3334;
const DISCOVERY_MAGIC = "CONTROLMESA_DISCOVER";

interface LanAddress {
  address: string;
  netmask: string;
  iface: string;
}

function ipToInt(ip: string) {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

/** Endereços IPv4 do computador na rede local (ignora loopback e link-local). */
function lanAddresses(): LanAddress[] {
  const list: LanAddress[] = [];
  for (const [iface, infos] of Object.entries(networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family !== "IPv4" || info.internal) continue;
      if (info.address.startsWith("169.254.")) continue;
      list.push({ address: info.address, netmask: info.netmask, iface });
    }
  }
  return list;
}

/** Endereço local que está na mesma sub-rede de quem perguntou (ou o primeiro). */
function addressFor(remote?: string) {
  const all = lanAddresses();
  if (remote) {
    const r = ipToInt(remote);
    const match = all.find((a) => {
      const mask = ipToInt(a.netmask);
      return (ipToInt(a.address) & mask) === (r & mask);
    });
    if (match) return match.address;
  }
  return all[0]?.address;
}

function serverInfo(port: number, remote?: string) {
  const addresses = lanAddresses();
  const best = addressFor(remote);
  return {
    app: "ControlMesa",
    name: hostname(),
    port,
    address: best ?? null,
    url: best ? `http://${best}:${port}` : null,
    urls: addresses.map((a) => `http://${a.address}:${port}`),
    interfaces: addresses.map((a) => ({ name: a.iface, address: a.address })),
  };
}

/**
 * Responde broadcasts UDP "CONTROLMESA_DISCOVER" com o endereço do servidor,
 * para que os apps o encontrem sem digitar IP.
 */
function startDiscoveryResponder(httpPort: number) {
  const socket = createSocket({ type: "udp4", reuseAddr: true });

  socket.on("message", (msg, rinfo) => {
    if (!msg.toString().trim().startsWith(DISCOVERY_MAGIC)) return;
    const reply = Buffer.from(JSON.stringify(serverInfo(httpPort, rinfo.address)));
    socket.send(reply, rinfo.port, rinfo.address);
  });

  socket.on("error", (err) => {
    console.warn(`Descoberta automática indisponível (UDP ${DISCOVERY_PORT}): ${err.message}`);
    socket.close();
  });

  socket.bind(DISCOVERY_PORT);
}

function printServerAddresses(port: number) {
  const addresses = lanAddresses();
  console.log(`Servidor online na porta ${port}`);
  console.log(`  Neste computador : http://localhost:${port}`);
  if (addresses.length === 0) {
    console.log("  Na rede local    : nenhuma rede detectada (conecte-se ao Wi-Fi/cabo)");
    return;
  }
  for (const a of addresses) {
    console.log(`  Na rede local    : http://${a.address}:${port}  (${a.iface})`);
  }
  console.log(`  Descoberta auto  : UDP ${DISCOVERY_PORT} · GET /server-info`);
}

export { serverInfo, startDiscoveryResponder, printServerAddresses };
