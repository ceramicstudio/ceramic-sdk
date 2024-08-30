import type { SignedEvent } from '@ceramic-sdk/events'
import type { Cacao } from '@didtools/cacao'

export function changeEventSignature(event: SignedEvent): SignedEvent {
  const [firstSignature, ...otherSignatures] = event.jws.signatures
  return {
    ...event,
    jws: {
      ...event.jws,
      signatures: [
        {
          ...firstSignature,
          signature: `${firstSignature.signature.slice(0, -4)}AAAA`,
        },
        ...otherSignatures,
      ],
    },
  }
}

export function changeCapabilitySignature(cacao: Cacao): Cacao {
  // biome-ignore lint/style/noNonNullAssertion: existing value
  const signature = cacao.s!
  return { ...cacao, s: { ...signature, s: `${signature.s.slice(0, -4)}AAAA` } }
}
