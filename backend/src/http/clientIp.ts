/**
 * Resolve a trustworthy client identity for rate limiting.
 *
 * Default (no TRUSTED_PROXIES): always use the TCP peer (`remoteAddress`) and
 * ignore client-supplied `X-Forwarded-For`.
 *
 * With TRUSTED_PROXIES: only when the immediate peer is on the allowlist,
 * walk the forwarded chain from the right and skip trusted hops to find the
 * originating client address.
 */

const IPV4_MAPPED_PREFIX = /^::ffff:/i

export function normalizeIp(raw: string | undefined | null): string {
  if (!raw) {
    return 'unknown'
  }

  let value = raw.trim().toLowerCase()
  if (!value) {
    return 'unknown'
  }

  // Strip optional zone id (fe80::1%eth0) and surrounding brackets.
  value = value.replace(/^\[|\]$/g, '')
  const zoneIndex = value.indexOf('%')
  if (zoneIndex >= 0) {
    value = value.slice(0, zoneIndex)
  }

  if (IPV4_MAPPED_PREFIX.test(value)) {
    value = value.replace(IPV4_MAPPED_PREFIX, '')
  }

  if (!isPlausibleIp(value)) {
    return 'unknown'
  }

  return value
}

function isPlausibleIp(value: string): boolean {
  if (value === 'unknown') {
    return false
  }

  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return value.split('.').every((octet) => {
      const n = Number(octet)
      return Number.isInteger(n) && n >= 0 && n <= 255
    })
  }

  // Loose IPv6 check (enough to reject obvious garbage / header injection).
  if (value.includes(':')) {
    return /^[0-9a-f:]+$/i.test(value) && value.length <= 45
  }

  return false
}

export function parseTrustedProxies(raw: string | undefined | null): string[] {
  if (!raw?.trim()) {
    return []
  }

  const seen = new Set<string>()
  for (const part of raw.split(',')) {
    const normalized = normalizeIp(part)
    if (normalized !== 'unknown') {
      seen.add(normalized)
    }
  }
  return [...seen]
}

function parseForwardedFor(header: string | string[] | undefined): string[] {
  if (!header) {
    return []
  }

  const raw = Array.isArray(header) ? header.join(',') : header
  return raw
    .split(',')
    .map((part) => normalizeIp(part))
    .filter((ip) => ip !== 'unknown')
}

export type ResolveClientIpInput = {
  remoteAddress: string | undefined | null
  forwardedFor: string | string[] | undefined
  trustedProxies: string[]
}

/**
 * Returns the client IP used for rate limiting and request context.
 */
export function resolveClientIp(input: ResolveClientIpInput): string {
  const peer = normalizeIp(input.remoteAddress)
  const trusted = new Set(input.trustedProxies.map((ip) => normalizeIp(ip)).filter((ip) => ip !== 'unknown'))

  if (trusted.size === 0) {
    return peer
  }

  if (peer === 'unknown' || !trusted.has(peer)) {
    // Direct client or untrusted intermediary — never honor forged XFF.
    return peer
  }

  const chain = [...parseForwardedFor(input.forwardedFor), peer]
  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const hop = chain[index]!
    if (!trusted.has(hop)) {
      return hop
    }
  }

  // Entire chain is trusted (misconfiguration); fall back to the peer.
  return peer
}
