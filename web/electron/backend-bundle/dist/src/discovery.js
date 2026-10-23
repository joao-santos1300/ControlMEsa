"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverInfo = serverInfo;
exports.startDiscoveryResponder = startDiscoveryResponder;
exports.printServerAddresses = printServerAddresses;
const dgram_1 = require("dgram");
const os_1 = require("os");
const DISCOVERY_PORT = Number(process.env.DISCOVERY_PORT) || 3334;
const DISCOVERY_MAGIC = "CONTROLMESA_DISCOVER";
function ipToInt(ip) {
    return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}
/** Endereços IPv4 do computador na rede local (ignora loopback e link-local). */
function lanAddresses() {
    const list = [];
    for (const [iface, infos] of Object.entries((0, os_1.networkInterfaces)())) {
        for (const info of infos ?? []) {
            if (info.family !== "IPv4" || info.internal)
                continue;
            if (info.address.startsWith("169.254."))
                continue;
            list.push({ address: info.address, netmask: info.netmask, iface });
        }
    }
    return list;
}
/** Endereço local que está na mesma sub-rede de quem perguntou (ou o primeiro). */
function addressFor(remote) {
    const all = lanAddresses();
    if (remote) {
        const r = ipToInt(remote);
        const match = all.find((a) => {
            const mask = ipToInt(a.netmask);
            return (ipToInt(a.address) & mask) === (r & mask);
        });
        if (match)
            return match.address;
    }
    return all[0]?.address;
}
function serverInfo(port, remote) {
    const addresses = lanAddresses();
    const best = addressFor(remote);
    return {
        app: "ControlMesa",
        name: (0, os_1.hostname)(),
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
function startDiscoveryResponder(httpPort) {
    const socket = (0, dgram_1.createSocket)({ type: "udp4", reuseAddr: true });
    socket.on("message", (msg, rinfo) => {
        if (!msg.toString().trim().startsWith(DISCOVERY_MAGIC))
            return;
        const reply = Buffer.from(JSON.stringify(serverInfo(httpPort, rinfo.address)));
        socket.send(reply, rinfo.port, rinfo.address);
    });
    socket.on("error", (err) => {
        console.warn(`Descoberta automática indisponível (UDP ${DISCOVERY_PORT}): ${err.message}`);
        socket.close();
    });
    socket.bind(DISCOVERY_PORT);
}
function printServerAddresses(port) {
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
