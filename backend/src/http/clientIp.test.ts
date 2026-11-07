import { describe, expect, it } from 'vitest'
import { normalizeIp, parseTrustedProxies, resolveClientIp } from './clientIp.js'

describe('resolveClientIp', () => {
  it('uses the socket peer and ignores X-Forwarded-For when no trusted proxies are configured', () => {
    expect(
      resolveClientIp({
        remoteAddress: '203.0.113.10',
        forwardedFor: '198.51.100.1',
        trustedProxies: [],
      }),
    ).toBe('203.0.113.10')
  })

  it('keeps applying the same peer identity when forged XFF values change', () => {
    const trustedProxies: string[] = []
    const first = resolveClientIp({
      remoteAddress: '203.0.113.10',
      forwardedFor: '1.1.1.1',
      trustedProxies,
    })
    const second = resolveClientIp({
      remoteAddress: '203.0.113.10',
      forwardedFor: '8.8.8.8, 9.9.9.9',
      trustedProxies,
    })
    expect(first).toBe('203.0.113.10')
    expect(second).toBe(first)
  })

  it('ignores X-Forwarded-For from an untrusted peer', () => {
    expect(
      resolveClientIp({
        remoteAddress: '203.0.113.50',
        forwardedFor: '198.51.100.9',
        trustedProxies: ['10.0.0.1'],
      }),
    ).toBe('203.0.113.50')
  })

  it('reads the client hop when the immediate peer is a trusted proxy', () => {
    expect(
      resolveClientIp({
        remoteAddress: '10.0.0.1',
        forwardedFor: '198.51.100.20',
        trustedProxies: ['10.0.0.1'],
      }),
    ).toBe('198.51.100.20')
  })

  it('walks a multi-hop chain and skips trailing trusted proxies', () => {
    expect(
      resolveClientIp({
        remoteAddress: '10.0.0.2',
        forwardedFor: '198.51.100.30, 10.0.0.1',
        trustedProxies: ['10.0.0.1', '10.0.0.2'],
      }),
    ).toBe('198.51.100.30')
  })

  it('normalizes IPv4-mapped IPv6 peers', () => {
    expect(
      resolveClientIp({
        remoteAddress: '::ffff:203.0.113.10',
        forwardedFor: '198.51.100.1',
        trustedProxies: [],
      }),
    ).toBe('203.0.113.10')
  })

  it('supports IPv6 peers and trusted proxies', () => {
    expect(
      resolveClientIp({
        remoteAddress: '2001:db8::1',
        forwardedFor: '2001:db8::cafe',
        trustedProxies: ['2001:db8::1'],
      }),
    ).toBe('2001:db8::cafe')
  })

  it('ignores invalid forwarded values and falls back to the peer', () => {
    expect(
      resolveClientIp({
        remoteAddress: '10.0.0.1',
        forwardedFor: 'not-an-ip, also bad',
        trustedProxies: ['10.0.0.1'],
      }),
    ).toBe('10.0.0.1')
  })

  it('handles missing forwarded headers behind a trusted proxy', () => {
    expect(
      resolveClientIp({
        remoteAddress: '10.0.0.1',
        forwardedFor: undefined,
        trustedProxies: ['10.0.0.1'],
      }),
    ).toBe('10.0.0.1')
  })
})

describe('parseTrustedProxies / normalizeIp', () => {
  it('parses a comma-separated allowlist and drops junk', () => {
    expect(parseTrustedProxies(' 10.0.0.1, ::ffff:10.0.0.2 ,bogus, ')).toEqual([
      '10.0.0.1',
      '10.0.0.2',
    ])
  })

  it('normalizes bracketed IPv6 with a zone id', () => {
    expect(normalizeIp('[fe80::1%eth0]')).toBe('fe80::1')
  })
})
