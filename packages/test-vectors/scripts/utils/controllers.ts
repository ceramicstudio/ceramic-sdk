import {
  createCapabilityDID,
  createExpiredCapabilityDID,
  ethereum,
  solana,
  webauthn,
  webcrypto,
} from '@ceramic-sdk/test-utils'
import type { AuthMethod } from '@didtools/cacao'
import { getAuthenticatedDID } from '@didtools/key-did'
import type { DID } from 'dids'

import type { ControllerType } from '../../src/index.ts'

import { TEST_MODEL_ID } from './streams.js'

const keyDID = await getAuthenticatedDID(new Uint8Array(32))

type ControllerCommon = {
  id: string
  signer: DID
}

type ControllerWithoutCapability = ControllerCommon & { withCapability: false }

type ControllerWithCapability = ControllerCommon & {
  withCapability: true
  expiredSigner: DID
  noResourceSigner: DID
  expectedModelSigner: DID
  otherModelSigner: DID
}

type Controller = ControllerWithoutCapability | ControllerWithCapability

async function createCapabilityController(
  authMethod: AuthMethod,
): Promise<ControllerWithCapability> {
  const [
    signer,
    expiredSigner,
    noResourceSigner,
    expectedModelSigner,
    otherModelSigner,
  ] = await Promise.all([
    createCapabilityDID(keyDID, authMethod, { resources: ['ceramic://*'] }),
    createExpiredCapabilityDID(keyDID, authMethod, {
      resources: ['ceramic://*'],
    }),
    createCapabilityDID(keyDID, authMethod, { resources: [] }),
    createCapabilityDID(keyDID, authMethod, {
      resources: [`ceramic://*?model=${TEST_MODEL_ID}`],
    }),
    createCapabilityDID(keyDID, authMethod, {
      resources: [
        'ceramic://*?model=k2t6wz4z9kggqqnbn3vqggh2z4fe9jctr9vvbc1em2yho0qnzzrtzz1n2hr4lr',
      ],
    }),
  ])
  return {
    withCapability: true,
    id: signer.id,
    signer,
    expiredSigner,
    noResourceSigner,
    expectedModelSigner,
    otherModelSigner,
  }
}

export const controllerFactories = {
  'key-ecdsa-p256': async () => {
    const keyPair = await webcrypto.getP256KeyPair()
    const signer = await webcrypto.getAuthenticatedDID(keyPair)
    return { withCapability: false, id: signer.id, signer }
  },
  'key-ed25519': () => {
    return { withCapability: false, id: keyDID.id, signer: keyDID }
  },
  'pkh-ethereum': async () => {
    const authMethod = await ethereum.getAuthMethod()
    return await createCapabilityController(authMethod)
  },
  'pkh-solana': async () => {
    const authMethod = await solana.getAuthMethod()
    return await createCapabilityController(authMethod)
  },
  'pkh-webauthn': async () => {
    const authMethod = await webauthn.getAuthMethod()
    return await createCapabilityController(authMethod)
  },
} satisfies Record<ControllerType, () => Controller | Promise<Controller>>
