# ⚡ WaveDrom, D2 & WebAssembly Text (WAT) Systems Showcase

> *Hardware timing analysis, cloud topology DAGs, and bare-metal WASM stack execution within Selene's unified document canvas.*

---

## 1. WaveDrom Digital Timing Waveforms

WaveDrom renders high-precision digital clock cycles, bus transitions, and SPI/I2C protocol timing directly from declarative JSON specifications.

```wavedrom
{
  "signal": [
    { "name": "CLK",   "wave": "p.......|..." },
    { "name": "CS#",   "wave": "10......|..1" },
    { "name": "MOSI",  "wave": "x3.4.5..|..x", "data": ["0x03", "ADDR_HI", "ADDR_LO"] },
    { "name": "MISO",  "wave": "z...6.7.|.z.", "data": ["BYTE_0", "BYTE_1"] },
    { "name": "READY", "wave": "0...1...|0.." }
  ],
  "head": { "text": "SPI Flash 4-Byte Burst Read Timing (Fast Read Mode)" },
  "foot": { "text": "T0       T1       T2       T3       T4       T5       T6       T7" }
}
```

### Hardware Register Bitfield Map (`regview`)
Document memory-mapped I/O (MMIO) and peripheral registers with bit ranges and access permissions:

```regview
{
  "reg": [
    { "name": "ENABLE", "bits": 1, "attr": "RW" },
    { "name": "MODE",   "bits": 3, "attr": "RW", "type": 2 },
    { "bits": 4 },
    { "name": "STATUS", "bits": 8, "attr": "RO", "type": 3 },
    { "name": "DIVIDER","bits": 16, "attr": "RW", "type": 5 }
  ],
  "config": { "bits": 32, "name": "TIMER_CTRL_REG" }
}
```

---

## 2. D2 Modern System Architecture Language

D2 is a modern declarative language designed specifically for cloud topologies, microservice architectures, and system dataflow DAGs.

```d2
direction: right

client: Client Tier {
  web: Next.js Web App {
    shape: circle
  }
  mobile: Flutter Mobile {
    shape: circle
  }
}

gateway: Selene API Gateway {
  shape: hexagon
  style.stroke: "#38bdf8"
}

services: Microservices Core {
  style.fill: "#091224"
  
  auth: Guardian Auth {
    shape: package
  }
  engine: Computation Engine {
    shape: cylinder
  }
  relay: Hermes Relay Hub {
    shape: queue
  }
}

storage: Data Layer {
  db: Primary PostgreSQL {
    shape: cylinder
  }
  cache: Redis Cluster {
    shape: cylinder
  }
}

client.web -> gateway: HTTPS GraphQL
client.mobile -> gateway: WebRTC CRDT
gateway -> services.auth: Validate JWT
gateway -> services.engine: Query Document
services.engine -> storage.cache: Cache Read (0.4ms)
services.engine -> storage.db: ACID Commit
services.engine -> services.relay: Broadcast Update
```

---

## 3. WebAssembly Text Format (WAT) Stack Evaluator

WebAssembly Text (`.wat`) compiles to binary bytecode and executes stack instructions with microsecond latency.

```wat
(module
  ;; Pure WebAssembly Text: High-Performance Mathematical Invariants
  (func $add (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add
  )

  (func $hypot_squared (param $x i32) (param $y i32) (result i32)
    local.get $x
    local.get $x
    i32.mul
    local.get $y
    local.get $y
    i32.mul
    i32.add
  )

  (func $fibonacci (param $n i32) (result i32)
    (local $a i32)
    (local $b i32)
    (local $temp i32)
    (local $i i32)

    local.get $n
    i32.const 2
    i32.lt_s
    if (result i32)
      local.get $n
      return
    end

    i32.const 0
    local.set $a
    i32.const 1
    local.set $b
    i32.const 2
    local.set $i

    block $break
      loop $loop
        local.get $i
        local.get $n
        i32.gt_s
        br_if $break

        local.get $a
        local.get $b
        i32.add
        local.set $temp

        local.get $b
        local.set $a
        local.get $temp
        local.set $b

        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $loop
      end
    end

    local.get $b
  )

  (memory (export "memory") 1)
  (export "add" (func $add))
  (export "hypot_squared" (func $hypot_squared))
  (export "fibonacci" (func $fibonacci))
)
```

---

*Compiled and rendered live via Selene's Phase 1 Multi-Language Engine.*
