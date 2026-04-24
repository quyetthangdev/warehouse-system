import type { BalanceFormValues } from '../schemas/balance-form.schema'

interface Props {
  open: boolean
  onSubmit: (values: BalanceFormValues) => Promise<void>
  onClose: () => void
}

export function BalanceFormDialog(_props: Props) {
  return null
}
