'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  CheckRow,
  ChoiceButton,
  ChoiceRow,
  DealbreakerList,
  FilePick,
  OtherChoiceInput,
  PageTitle,
  Question,
  SelectInput,
  SchoolSelect,
  Statement,
  TextArea,
  TextInput,
} from '@/components/test-run/fields'
import { ScheduleCalendar } from '@/components/test-run/schedule-calendar'
import { submitTestRun } from '@/app/actions/test-run'
import { testRunContent as copy } from '@/lib/test-run-content'
import { serializeScheduleSlots } from '@/lib/test-run-schedule'
import {
  emptyTestRunState,
  looksLikePersonalInbox,
  validateTestRunPage,
  type TestRunFormState,
} from '@/lib/validations/test-run'
import {
  nextStep,
  prevStep,
  stepBadgeNumber,
  stepCount,
  stepIndex,
  validateTestRunStep,
  type TestRunStepId,
} from '@/lib/test-run-steps'

type Screen = 'welcome' | TestRunStepId | 'ending-ok' | 'ending-no' | 'ending-age' | 'ending-graduated'

interface TestRunFormProps {
  prefillEmail?: string
  howHeard?: string
}

export function TestRunForm({ prefillEmail, howHeard }: TestRunFormProps) {
  const reduceMotion = useReducedMotion()
  const [screen, setScreen] = useState<Screen>('welcome')
  const [direction, setDirection] = useState(1)
  const [values, setValues] = useState<TestRunFormState>(() =>
    emptyTestRunState({ email: prefillEmail, howHeard })
  )
  const [errors, setErrors] = useState<ReturnType<typeof validateTestRunStep>>({})
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const isStep = (s: Screen): s is TestRunStepId =>
    s !== 'welcome' &&
    s !== 'ending-ok' &&
    s !== 'ending-no' &&
    s !== 'ending-age' &&
    s !== 'ending-graduated'

  const emailWarn =
    screen === 'email' && values.email && looksLikePersonalInbox(values.email)
      ? copy.pages[3].emailWarn
      : null

  const progressWidth = useMemo(() => {
    if (screen === 'welcome') return 0
    if (
      screen === 'ending-ok' ||
      screen === 'ending-no' ||
      screen === 'ending-age' ||
      screen === 'ending-graduated'
    ) {
      return 100
    }
    const total = stepCount(values)
    const index = stepIndex(screen, values)
    if (total <= 0 || index < 0) return 0
    return ((index + 1) / total) * 100
  }, [screen, values])

  function patch(next: Partial<TestRunFormState>) {
    setValues((current) => ({
      ...current,
      scheduleSlots: current.scheduleSlots ?? [],
      ...next,
    }))
  }

  function go(next: Screen, dir = 1) {
    setDirection(dir)
    setErrors({})
    setSubmitError('')
    setScreen(next)
  }

  function continueFromStep(current: TestRunStepId) {
    let state = values
    if (current === 'gender' && values.gender === 'Other' && !values.genderOther.trim()) {
      state = { ...values, gender: '', genderOther: '' }
      patch({ gender: '', genderOther: '' })
    }
    if (
      current === 'yearLevel' &&
      values.yearLevel === 'Others' &&
      !values.yearLevelOther.trim()
    ) {
      state = { ...values, yearLevel: '', yearLevelOther: '' }
      patch({ yearLevel: '', yearLevelOther: '' })
    }
    if (
      current === 'meetGenders' &&
      values.meetGenders.includes('Other') &&
      !values.meetOther.trim()
    ) {
      state = {
        ...values,
        meetGenders: values.meetGenders.filter((item) => item !== 'Other'),
        meetOther: '',
      }
      patch({
        meetGenders: state.meetGenders,
        meetOther: '',
      })
    }

    const nextErrors = validateTestRunStep(current, state)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (current === 'wantIn' && state.wantIn === 'no' && state.consent) {
      go('ending-no')
      return
    }

    if (current === 'coverOwnOrder' && state.coverOwnOrder === 'no') {
      go('ending-no')
      return
    }

    if (current === 'yearLevel' && state.yearLevel === 'Graduated') {
      go('ending-graduated')
      return
    }

    const ageValue = Number(state.age)
    if (
      current === 'age' &&
      state.age.trim() &&
      Number.isInteger(ageValue) &&
      ageValue < 18
    ) {
      go('ending-age')
      return
    }

    if (current === 'school' && state.school.trim() && !state.campus.trim()) {
      patch({ campus: state.school })
    }

    const next = nextStep(current, state)
    if (next === 'submit') {
      void handleSubmit()
      return
    }
    go(next, 1)
  }

  function backFromStep(current: TestRunStepId) {
    const prev = prevStep(current, values)
    if (prev === 'welcome') {
      go('welcome', -1)
      return
    }
    go(prev, -1)
  }

  async function handleSubmit() {
    const allErrors: ReturnType<typeof validateTestRunPage> = {}
    for (const page of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      Object.assign(allErrors, validateTestRunPage(page, values))
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setSubmitError('Some answers still need a look. Go back and fill the gaps.')
      return
    }

    setPending(true)
    setSubmitError('')
    const formData = new FormData()
    const skip = new Set([
      'facePhoto',
      'schoolIdPhoto',
      'meetGenders',
      'dealbreakers',
      'scheduleSlots',
      'yearLevelOther',
    ])
    for (const [key, value] of Object.entries(values)) {
      if (skip.has(key)) continue
      if (typeof value === 'boolean') formData.set(key, value ? 'true' : 'false')
      else if (typeof value === 'string') formData.set(key, value)
    }
    formData.set(
      'yearLevel',
      values.yearLevel === 'Others'
        ? values.yearLevelOther.trim()
        : values.yearLevel
    )
    for (const option of values.meetGenders) {
      if (option === 'Other') {
        const other = values.meetOther.trim()
        formData.append('meetGenders', other ? `Other: ${other}` : 'Other')
      } else {
        formData.append('meetGenders', option)
      }
    }
    formData.set(
      'dealbreakers',
      values.dealbreakers.map((item) => item.trim()).filter(Boolean).join('\n')
    )
    formData.set('schedule', serializeScheduleSlots(values.scheduleSlots))
    formData.set('understandData', values.consent || values.understandData ? 'true' : 'false')
    if (values.facePhoto) formData.set('facePhoto', values.facePhoto)
    if (values.schoolIdPhoto) formData.set('schoolIdPhoto', values.schoolIdPhoto)

    // Preview: still show the success ending if the backend isn't ready yet.
    try {
      const result = await submitTestRun(formData)
      setPending(false)
      if (result.code === 'under18') {
        go('ending-age')
        return
      }
      if (result.code === 'declined') {
        go('ending-no')
        return
      }
    } catch {
      setPending(false)
    }
    go('ending-ok')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [screen, reduceMotion])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (pending) return
      const target = event.target as HTMLElement | null
      const isMetaEnter =
        (event.metaKey || event.ctrlKey) && event.key === 'Enter'
      if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey) {
        if (target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT') return
        if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return
        if (screen === 'dealbreakers') return
      } else if (!isMetaEnter) {
        return
      }
      if (screen === 'welcome') {
        event.preventDefault()
        go('intro')
        return
      }
      if (isStep(screen)) {
        event.preventDefault()
        continueFromStep(screen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const slide = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }
    return {
      initial: { opacity: 0, y: direction * 36 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: direction * -36 },
    }
  }, [direction, reduceMotion])

  const continueLabel =
    isStep(screen) && nextStep(screen, values) === 'submit'
      ? copy.submit
      : copy.continue

  return (
    <div className="test-run relative min-h-[100dvh] overflow-x-hidden text-[var(--q-text)]">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <Image
          src="/brand/test-run-backdrop.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[rgb(68_25_37/0.28)]" />
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-40 bg-[var(--q-track)]"
        style={{ height: 'var(--q-progress-h)' }}
      >
        <div
          key={String(screen)}
          className="h-full bg-[var(--q-fill)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${progressWidth}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressWidth)}
          aria-label={copy.progressLabel}
        />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col pt-[var(--q-image-peek)]">
        <div className="relative flex min-h-[calc(100dvh-var(--q-image-peek))] flex-1 flex-col overflow-hidden bg-[var(--q-bg)] shadow-[0_-12px_40px_rgb(0_0_0/0.18)]">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={String(screen)}
              initial={slide.initial}
              animate={slide.animate}
              exit={slide.exit}
              transition={{
                duration: reduceMotion ? 0.01 : 0.34,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex w-full flex-1 flex-col"
            >
              {screen === 'welcome' ? (
                <Cover
                  onStart={() => go('intro')}
                  headline={copy.coverHeadline}
                  sub={copy.coverSub}
                  action={copy.continue}
                />
              ) : null}
              {screen === 'ending-ok' ? (
                <Cover
                  headline={copy.endings.matched.headline}
                  sub={copy.endings.matched.body}
                />
              ) : null}
              {screen === 'ending-no' ? (
                <Cover
                  headline={copy.endings.declined.headline}
                  sub={copy.endings.declined.body}
                />
              ) : null}
              {screen === 'ending-age' ? (
                <Cover
                  headline={copy.endings.under18.headline}
                  sub={copy.endings.under18.body}
                />
              ) : null}
              {screen === 'ending-graduated' ? (
                <Cover
                  headline={copy.endings.graduated.headline}
                  sub={copy.endings.graduated.body}
                />
              ) : null}
              {isStep(screen) ? (
                <FormShell
                  stepNumber={stepBadgeNumber(screen, values)}
                  onContinue={() => continueFromStep(screen)}
                  continueLabel={continueLabel}
                  pending={pending}
                  submitError={submitError}
                >
                  <StepBody
                    step={screen}
                    values={values}
                    errors={errors}
                    emailWarn={emailWarn}
                    patch={patch}
                    onContinue={() => continueFromStep(screen)}
                  />
                </FormShell>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {isStep(screen) ? (
        <div
          className="fixed z-30 flex items-center gap-1.5"
          style={{
            right: 'var(--q-footer-inset)',
            bottom: 'calc(24px + env(safe-area-inset-bottom))',
          }}
        >
          <button
            type="button"
            onClick={() => backFromStep(screen)}
            aria-label={copy.back}
            className="grid h-[var(--q-chevron)] w-[var(--q-chevron)] place-items-center rounded-[var(--q-ok-radius)] bg-[var(--q-ok-bg)] text-[var(--q-ok-text)] transition-transform active:scale-[0.96]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m6 15 6-6 6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => continueFromStep(screen)}
            disabled={pending}
            aria-label={continueLabel}
            className="grid h-[var(--q-chevron)] w-[var(--q-chevron)] place-items-center rounded-[var(--q-ok-radius)] bg-[var(--q-ok-bg)] text-[var(--q-ok-text)] transition-transform active:scale-[0.96] disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  )
}

function Cover({
  headline,
  kicker,
  sub,
  action,
  onStart,
}: {
  headline: string
  kicker?: string
  sub?: string
  action?: string
  onStart?: () => void
}) {
  return (
    <section className="relative flex w-full min-w-0 flex-1 flex-col px-6 py-16 text-[var(--q-text)] md:px-10 md:py-24">
      <div className="mx-auto flex w-full max-w-[var(--q-col-max)] flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-open-sauce w-full min-w-0 text-[length:var(--q-title)] font-medium leading-snug tracking-tight">
          {headline}
        </h1>
        {kicker ? (
          <p className="font-open-sauce mt-4 w-full min-w-0 text-[length:var(--q-body)] font-normal text-[var(--q-muted)]">
            {kicker}
          </p>
        ) : null}
        {sub ? (
          <p className="font-open-sauce mt-5 w-full min-w-0 max-w-[36rem] text-center text-[length:var(--q-body)] font-normal leading-relaxed text-[var(--q-muted)]">
            {sub}
          </p>
        ) : null}
        {onStart ? (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-[var(--q-ok-h)] min-w-[56px] items-center justify-center rounded-[var(--q-ok-radius)] bg-[var(--q-ok-bg)] px-5 font-open-sauce text-base font-bold text-[var(--q-ok-text)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
            >
              {action ?? copy.start}
            </button>
            <p className="text-base font-normal text-[var(--q-muted)]">
              {copy.enterHint}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function FormShell({
  stepNumber,
  onContinue,
  continueLabel,
  pending,
  submitError,
  children,
}: {
  stepNumber: number
  onContinue: () => void
  continueLabel: string
  pending: boolean
  submitError?: string
  children: ReactNode
}) {
  const isSubmit = continueLabel === copy.submit
  return (
    <div className="relative mx-auto flex w-full max-w-[var(--q-col-max)] flex-1 flex-col justify-center px-6 py-16 md:px-10 md:py-24">
      <div className="flex w-full flex-col gap-8">
        {children}
        {submitError ? (
          <p
            role="alert"
            className="rounded-[4px] border border-[var(--q-text)] px-3 py-2 text-base font-medium text-[var(--q-text)]"
          >
            {submitError}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3.5 pt-1">
          <button
            type="button"
            onClick={onContinue}
            disabled={pending}
            className="inline-flex h-[var(--q-ok-h)] min-w-[56px] items-center justify-center rounded-[var(--q-ok-radius)] bg-[var(--q-ok-bg)] px-5 font-open-sauce text-base font-bold text-[var(--q-ok-text)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? copy.submitting : continueLabel}
          </button>
          <p className="text-base font-normal text-[var(--q-muted)]">
            {isSubmit ? 'press Cmd + Enter' : copy.enterHint}
          </p>
        </div>
        <p className="sr-only">Question {stepNumber}</p>
      </div>
    </div>
  )
}

function StepBody({
  step,
  values,
  errors,
  emailWarn,
  patch,
  onContinue,
}: {
  step: TestRunStepId
  values: TestRunFormState
  errors: ReturnType<typeof validateTestRunStep>
  emailWarn: string | null
  patch: (next: Partial<TestRunFormState>) => void
  onContinue: () => void
}) {
  const p = copy.pages
  const n = stepBadgeNumber(step, values)

  switch (step) {
    case 'intro':
      return (
        <>
          <PageTitle page={n}>{p[1].title}</PageTitle>
          <Statement>{p[1].statement}</Statement>
        </>
      )
    case 'consent':
      return (
        <Question
          number={n}
          title={p[1].consentTitle}
          helper={p[1].consentHelper}
          error={errors.consent}
        >
          <CheckRow
            checked={values.consent}
            onChange={(consent) => patch({ consent, understandData: consent })}
          >
            {p[1].consent}
          </CheckRow>
        </Question>
      )
    case 'wantIn':
      return (
        <Question title={p[1].wantIn} helper={p[1].wantInHelper} error={errors.wantIn} number={n}>
          <ChoiceRow>
            <ChoiceButton
              selected={values.wantIn === 'yes'}
              onClick={() => patch({ wantIn: 'yes' })}
            >
              {copy.yes}
            </ChoiceButton>
            <ChoiceButton
              selected={values.wantIn === 'no'}
              onClick={() => patch({ wantIn: 'no' })}
            >
              {copy.no}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
      )
    case 'campus':
      return null
    case 'cityCorridor':
      return (
        <Question title={p[2].city} htmlFor="cityCorridor" helper={p[2].cityHelper} error={errors.cityCorridor} number={n}>
          <SelectInput
            id="cityCorridor"
            value={values.cityCorridor}
            invalid={Boolean(errors.cityCorridor)}
            onChange={(event) => patch({ cityCorridor: event.target.value })}
          >
            <option value="">Choose one</option>
            {copy.cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </SelectInput>
        </Question>
      )
    case 'cityCorridorOther':
      return (
        <Question title={p[2].cityOther} htmlFor="cityCorridorOther" error={errors.cityCorridorOther} number={n}>
          <TextInput
            id="cityCorridorOther"
            value={values.cityCorridorOther}
            invalid={Boolean(errors.cityCorridorOther)}
            onChange={(event) => patch({ cityCorridorOther: event.target.value })}
          />
        </Question>
      )
    case 'fullName':
      return (
        <Question title={p[3].fullName} htmlFor="fullName" error={errors.fullName} number={n}>
          <TextInput
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={values.fullName}
            invalid={Boolean(errors.fullName)}
            onChange={(event) => patch({ fullName: event.target.value })}
          />
        </Question>
      )
    case 'age':
      return (
        <Question title={p[3].age} htmlFor="age" helper={p[3].ageHelper} error={errors.age} number={n}>
          <TextInput
            id="age"
            inputMode="numeric"
            value={values.age}
            invalid={Boolean(errors.age)}
            onChange={(event) => patch({ age: event.target.value })}
          />
        </Question>
      )
    case 'email':
      return (
        <Question
          title={p[3].email}
          htmlFor="email"
          helper={emailWarn ?? p[3].emailHelper}
          error={errors.email} number={n}>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => patch({ email: event.target.value })}
          />
        </Question>
      )
    case 'phone':
      return (
        <Question title={p[3].phone} htmlFor="phone" helper={p[3].phoneHelper} error={errors.phone} number={n}>
          <TextInput
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => patch({ phone: event.target.value })}
          />
        </Question>
      )
    case 'socials':
      return (
        <Question title={p[3].socials} htmlFor="socials" number={n}>
          <TextInput
            id="socials"
            value={values.socials}
            invalid={Boolean(errors.socials)}
            onChange={(event) => patch({ socials: event.target.value })}
          />
        </Question>
      )
    case 'contactPreference':
      return (
        <Question title={p[3].contact} error={errors.contactPreference} number={n}>
          <ChoiceRow>
            {copy.contactOptions.map((option) => (
              <ChoiceButton
                key={option}
                selected={values.contactPreference === option}
                onClick={() => patch({ contactPreference: option })}
              >
                {option}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        </Question>
      )
    case 'facePhoto':
      return (
        <Question
          title={p[4].face}
          helper={p[4].faceHelper}
          error={errors.facePhoto}
          number={n}
        >
          <FilePick
            id="facePhoto"
            label={copy.uploadPrompt}
            file={values.facePhoto}
            error={errors.facePhoto}
            onChange={(facePhoto) =>
              patch({ facePhoto, schoolIdPhoto: facePhoto })
            }
          />
          <ul className="mt-3 flex flex-col gap-1.5 text-base font-normal leading-snug text-[var(--q-muted)]">
            {p[4].faceTips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden className="shrink-0 text-[var(--q-text)]">
                  ·
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Question>
      )
    case 'schoolIdPhoto':
      return null
    case 'isMe':
      return null
    case 'gender':
      return (
        <Question
          title={p[5].gender}
          error={errors.gender || errors.genderOther}
          number={n}
        >
          <ChoiceRow>
            {copy.genderOptions.map((option) =>
              option === 'Other' ? (
                <OtherChoiceInput
                  key={option}
                  active={values.gender === 'Other'}
                  value={values.genderOther}
                  invalid={Boolean(errors.genderOther)}
                  onActivate={() => patch({ gender: 'Other' })}
                  onChange={(genderOther) => patch({ genderOther })}
                  onClear={() => patch({ gender: '', genderOther: '' })}
                />
              ) : (
                <ChoiceButton
                  key={option}
                  selected={values.gender === option}
                  onClick={() =>
                    patch({ gender: option, genderOther: '' })
                  }
                >
                  {option}
                </ChoiceButton>
              )
            )}
          </ChoiceRow>
        </Question>
      )
    case 'genderOther':
      return null
    case 'meetGenders':
      return (
        <Question
          title={p[5].meet}
          helper={p[5].meetHelper}
          error={errors.meetGenders || errors.meetOther}
          number={n}
        >
          <ChoiceRow>
            {copy.meetOptions.map((option) => {
              if (option === 'Other') {
                return (
                  <OtherChoiceInput
                    key={option}
                    shape="square"
                    active={values.meetGenders.includes('Other')}
                    value={values.meetOther}
                    invalid={Boolean(errors.meetOther)}
                    onActivate={() =>
                      patch({
                        meetGenders: values.meetGenders.includes('Other')
                          ? values.meetGenders
                          : [...values.meetGenders, 'Other'],
                      })
                    }
                    onChange={(meetOther) => patch({ meetOther })}
                    onClear={() =>
                      patch({
                        meetGenders: values.meetGenders.filter(
                          (item) => item !== 'Other'
                        ),
                        meetOther: '',
                      })
                    }
                  />
                )
              }
              const selected = values.meetGenders.includes(option)
              return (
                <ChoiceButton
                  key={option}
                  shape="square"
                  selected={selected}
                  onClick={() =>
                    patch({
                      meetGenders: selected
                        ? values.meetGenders.filter((item) => item !== option)
                        : [...values.meetGenders, option],
                    })
                  }
                >
                  {option}
                </ChoiceButton>
              )
            })}
          </ChoiceRow>
        </Question>
      )
    case 'meetOther':
      return null
    case 'school':
      return (
        <Question title={p[5].school} htmlFor="school" error={errors.school} number={n}>
          <SchoolSelect
            id="school"
            value={values.school}
            invalid={Boolean(errors.school)}
            options={copy.schoolOptions}
            onChange={(school) => patch({ school, campus: school })}
          />
        </Question>
      )
    case 'yearLevel':
      return (
        <Question
          title={p[5].year}
          error={errors.yearLevel || errors.yearLevelOther}
          number={n}
        >
          <ChoiceRow>
            {copy.yearOptions.map((year) =>
              year === 'Others' ? (
                <OtherChoiceInput
                  key={year}
                  label="Others"
                  active={values.yearLevel === 'Others'}
                  value={values.yearLevelOther}
                  invalid={Boolean(errors.yearLevelOther)}
                  onActivate={() => patch({ yearLevel: 'Others' })}
                  onChange={(yearLevelOther) => patch({ yearLevelOther })}
                  onClear={() => patch({ yearLevel: '', yearLevelOther: '' })}
                />
              ) : (
                <ChoiceButton
                  key={year}
                  selected={values.yearLevel === year}
                  onClick={() =>
                    patch({ yearLevel: year, yearLevelOther: '' })
                  }
                >
                  {year}
                </ChoiceButton>
              )
            )}
          </ChoiceRow>
        </Question>
      )
    case 'departureArea':
      return null
    case 'maxTravel':
      return (
        <Question title={p[5].travel} error={errors.maxTravel} number={n}>
          <ChoiceRow>
            {copy.travelOptions.map((option) => (
              <ChoiceButton
                key={option}
                selected={values.maxTravel === option}
                onClick={() => patch({ maxTravel: option })}
              >
                {option}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        </Question>
      )
    case 'nearbySchoolOk':
      return null
    case 'dealbreakers':
      return (
        <Question
          title={p[5].dealbreakers}
          htmlFor="dealbreakers"
          helper={p[5].dealbreakersHelper}
          error={errors.dealbreakers}
          number={n}
        >
          <DealbreakerList
            id="dealbreakers"
            values={values.dealbreakers}
            invalid={Boolean(errors.dealbreakers)}
            onChange={(dealbreakers) => patch({ dealbreakers })}
            onComplete={onContinue}
          />
        </Question>
      )
    case 'aboutYou':
      return (
        <Question
          title={p[5].about}
          htmlFor="aboutYou"
          error={errors.aboutYou}
          number={n}
        >
          <TextInput
            id="aboutYou"
            value={values.aboutYou}
            invalid={Boolean(errors.aboutYou)}
            onChange={(event) => patch({ aboutYou: event.target.value })}
          />
        </Question>
      )
    case 'preferredCafes':
      return null
    case 'refuseAreas':
      return null
    case 'coverOwnOrder':
      return (
        <Question
          title={p[5].cover}
          helper={p[5].coverHelper}
          error={errors.coverOwnOrder}
          number={n}
        >
          <ChoiceRow>
            <ChoiceButton
              selected={values.coverOwnOrder === 'yes'}
              onClick={() => patch({ coverOwnOrder: 'yes' })}
            >
              {p[5].coverAgree}
            </ChoiceButton>
            <ChoiceButton
              selected={values.coverOwnOrder === 'no'}
              onClick={() => patch({ coverOwnOrder: 'no' })}
            >
              {p[5].coverDisagree}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
      )
    case 'accessibility':
      return null
    case 'schedule':
      return (
        <Question
          title={p[6].when}
          helper={p[6].whenHelper}
          error={errors.scheduleSlots}
          number={n}
        >
          <ScheduleCalendar
            value={values.scheduleSlots ?? []}
            invalid={Boolean(errors.scheduleSlots)}
            onChange={(scheduleSlots) => patch({ scheduleSlots })}
          />
        </Question>
      )
    case 'hardNos':
      return null
    case 'cancelEarly':
      return (
        <Question
          title={p[7].cancelEarly}
          helper={p[7].cancelEarlyHelper}
          error={errors.cancelEarly}
          number={n}
        >
          <ChoiceRow>
            <ChoiceButton
              selected={values.cancelEarly === 'yes'}
              onClick={() => patch({ cancelEarly: 'yes' })}
            >
              {copy.yes}
            </ChoiceButton>
            <ChoiceButton
              selected={values.cancelEarly === 'no'}
              onClick={() => patch({ cancelEarly: 'no' })}
            >
              {copy.no}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
      )
    case 'understandEarly':
      return null
    case 'publicCafe':
      return null
    case 'canReport':
      return null
    case 'interviewOk':
      return (
        <Question
          title={p[7].interview}
          helper={p[7].interviewHelper}
          error={errors.interviewOk}
          number={n}
        >
          <ChoiceRow>
            <ChoiceButton
              selected={values.interviewOk === true}
              onClick={() => patch({ interviewOk: true })}
            >
              {copy.yes}
            </ChoiceButton>
            <ChoiceButton
              selected={values.interviewOk === false}
              onClick={() => patch({ interviewOk: false })}
            >
              {copy.no}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
      )
    case 'emergencyName':
      return null
    case 'emergencyPhone':
      return null
    case 'dataNotice':
      return null
    case 'dataUse':
      return null
    case 'everythingTrue':
      return null
    case 'howHeard':
      return (
        <Question title={p[9].howHeard} htmlFor="howHeard" optional number={n}>
          <TextInput
            id="howHeard"
            value={values.howHeard}
            onChange={(event) => patch({ howHeard: event.target.value })}
          />
        </Question>
      )
  }
}
