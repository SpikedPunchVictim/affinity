const crypto = require('crypto')

let HexMap = new Array<string>()

// Populate the HexMap with ascii hex values
for(let i = 0; i < 256; ++i) {
   HexMap.push((i + 0x100).toString(16).substring(1))
}

export function uuid(): string {
   let bytes = new Uint8Array(16)
   crypto.randomFillSync(bytes)
   let hex = bytes.map(b => HexMap[b.toString().toLowerCase()])

   return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
 }