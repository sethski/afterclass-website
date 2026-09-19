import { createTestRunClient } from '@afterclass/db'

export function service() {
  return createTestRunClient()
}
