export interface StepIndicatorProps {
  readonly steps: readonly { readonly title: string; readonly description?: string }[]
  readonly currentStep: number
  readonly visitedSteps: ReadonlySet<number>
}