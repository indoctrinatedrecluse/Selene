# ⚡ Hermes Relay (Olympus Gateway) API & GraphQL Playground Showcase

Selene now features **⚡ Hermes Relay**, an in-document interactive API console and playground engine for **HTTP**, **REST**, **cURL**, and **GraphQL** code blocks (`http`, `rest`, `curl`, and `graphql`)! 

Named in honor of **Hermes**, the fleet-footed Messenger of Olympus and Herald of the Gods, this engine transforms static API documentation, cURL snippets, and GraphQL schemas into living, executable playgrounds with zero configuration.

> [!NOTE]
> ⚡ **Dual Relay Execution Runtime**:
> 1. **Live Relay Mode**: Dispatches real network requests directly from the client using the browser's Fetch API with full support for custom headers, query parameters, and JSON payloads.
> 2. **Celestial Mock Mode**: Automatically engages when offline, targeting simulated internal endpoints (`api.olympus.celestial`), or when local CORS isolation restricts cross-origin dispatches. Returns rich telemetry payloads with sub-millisecond execution times.

---

## ⚡ 1. Interactive HTTP / REST Request Block

Below is a live HTTP block defining an authenticated telemetry inquiry to the Olympus Gateway. Click **Dispatch Relay** in the block preview to transmit the request and inspect the response payload, headers, and latency:

```http
GET /api/celestial/telemetry?cluster=olympus-prime&node=alpha-01 HTTP/1.1
Host: api.olympus.celestial
Authorization: Bearer hermes_astral_token_99182
Accept: application/json
X-Hermes-Relay: celestial-gateway-v4
```

---

## ⚡ 2. Executable cURL Command with JSON Payload

Selene parses raw cURL snippets into an interactive GUI request builder with method badges, dynamic key-value header editors, and JSON payload formatters:

```curl
curl -X POST https://api.olympus.celestial/api/v1/dispatch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer selene_herald_token_482" \
  -H "X-Hermes-Priority: high" \
  -d '{
    "mission": "Apollo-Zephyr-IX",
    "target": "Mare Tranquillitatis",
    "burnDurationSeconds": 142.5,
    "thrustPercent": 96.8,
    "payloadStatus": "nominal"
  }'
```

---

## ⚡ 3. Federated GraphQL Orbital Guidance Query

Hermes Relay natively understands GraphQL query syntax, variables, and schema exploration:

```graphql
query GetOrbitalGuidance($missionId: ID!, $includeTelemetry: Boolean!) {
  mission(id: $missionId) {
    id
    name
    trajectory
    fuelReserveKg
    telemetry @include(if: $includeTelemetry) {
      velocityKmS
      angularMomentum
      thermalShieldStatus
    }
    crewManifest {
      name
      role
    }
  }
}

# Variables:
# {
#   "missionId": "selene-artemis-4",
#   "includeTelemetry": true
# }
```

---

## ⚡ 4. Local Selene Health API Inspection

You can also use Hermes Relay to probe Selene's own local REST API endpoints running directly inside your workspace:

```rest
GET /api/health HTTP/1.1
Host: localhost:3000
Accept: application/json
User-Agent: Selene-Hermes-Relay/1.0
```

---

## 🚀 Key Hermes Relay Capabilities in Selene

- **Multi-Grammar Parsing**: Auto-detects and structures standard RFC 7230 HTTP requests, command-line cURL arguments, and GraphQL query documents.
- **Interactive Headers & Parameters Builder**: Add, edit, disable, or delete request headers and query parameters via reactive key-value rows.
- **Latency & Size Telemetry**: Measures network round-trip response duration (`ms`), response payload weight (`KB`), and status code classifications.
- **Bidirectional cURL Export**: Generates an exact, copyable `curl -X ...` command representing any modifications made in the GUI.
- **JSON Filter & Clipboard Sync**: Filter response keys with instant substring search and copy payload trees with 1-click clipboard integration.
- **Sandbox Auto-Fix Lens**: AI-assisted diagnosis and automatic correction for invalid JSON payloads or malformed query headers.
