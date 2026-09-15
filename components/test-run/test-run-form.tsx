'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { TestRunMark } from '@/components/test-run/test-run-mark'
import {
  CheckRow,
  ChoiceButton,
  ChoiceRow,
  FilePick,
  Question,
  SelectInput,
  Statement,
  TextArea,
  TextInput,
} from '@/components/test-run/fields'
import { submitTestRun } from '@/app/actions/test-run'
import { testRunContent as copy } from '@/lib/test-run-content'
import {
  emptyTestRunState,
  looksLikePersonalInbox,
  validateTestRunPage,
  type TestRunFormState,
} from '@/lib/validations/test-run'

type Screen = 'welcome' | number | 'ending-ok' | 'ending-no' | 'ending-age'

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
  const [errors, setErrors] = useState<ReturnType<typeof validateTestRunPage>>({})
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const page = typeof screen === 'number' ? screen : 0
  const emailWarn =
    page === 3 && values.email && looksLikePersonalInbox(values.email)
      ? copy.pages[3].emailWarn
      : null

  function patch(next: Partial<TestRunFormState>) {
    setValues((current) => ({ ...current, ...next }))
  }

  function go(next: Screen, dir = 1) {
    setDirection(dir)
    setErrors({})
    setSubmitError('')
    setScreen(next)
  }

  function continueFromPage(current: number) {
    if (current === 1 && values.wantIn === 'no' && values.consent) {
      go('ending-no')
      return
    }
    const ageValue = Number(values.age)
    if (
      current === 3 &&
      values.age.trim() &&
      Number.isInteger(ageValue) &&
      ageValue < 18
    ) {
      go('ending-age')
      return
    }

    const nextErrors = validateTestRunPage(current, values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (current === 4 && !values.school.trim()) {
      patch({ school: values.campus })
    }
    if (current === 9) {
      void handleSubmit()
      return
    }
    go(current + 1, 1)
  }

  function backFromPage(current: number) {
    if (current <= 1) {
      go('welcome', -1)
      return
    }
    go(current - 1, -1)
  }

  async function handleSubmit() {
    const allErrors = {
      ...validateTestRunPage(4, values),
      ...validateTestRunPage(9, values),
    }
    const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (const item of pages) {
      Object.assign(allErrors, validateTestRunPage(item, values))
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setSubmitError('Some answers still need a look. Go back and fill the gaps.')
      return
    }

    setPending(true)
    setSubmitError('')
    const formData = new FormData()
    const skip = new Set(['facePhoto', 'schoolIdPhoto', 'meetGenders'])
    for (const [key, value] of Object.entries(values)) {
      if (skip.has(key)) continue
      if (typeof value === 'boolean') formData.set(key, value ? 'true' : 'false')
      else if (typeof value === 'string') formData.set(key, value)
    }
    for (const option of values.meetGenders) formData.append('meetGenders', option)
    if (values.facePhoto) formData.set('facePhoto', values.facePhoto)
    if (values.schoolIdPhoto) formData.set('schoolIdPhoto', values.schoolIdPhoto)

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
    if (!result.ok) {
      setSubmitError(result.message)
      return
    }
    go('ending-ok')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [screen, reduceMotion])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Enter' || pending) return
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT') return
      if (target?.tagName === 'BUTTON' || target?.tagName === 'A') return
      if (screen === 'welcome') {
        event.preventDefault()
        go(1)
        return
      }
      if (typeof screen === 'number') {
        event.preventDefault()
        continueFromPage(screen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, values, pending])

  const slide = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }
    return {
      initial: { opacity: 0, x: direction * 28 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: direction * -28 },
    }
  }, [direction, reduceMotion])

  return (
    <div className="test-run relative min-h-[100dvh] overflow-x-hidden bg-cream text-charcoal">
      {typeof screen === 'number' ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-dusty/20">
          <div
            className="h-full bg-salmon transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${(screen / 9) * 100}%` }}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={9}
            aria-valuenow={screen}
            aria-label={copy.progressLabel}
          />
        </div>
      ) : null}

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={String(screen)}
          initial={slide.initial}
          animate={slide.animate}
          exit={slide.exit}
          transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-[100dvh]"
        >
          {screen === 'welcome' ? (
            <Cover
              onStart={() => go(1)}
              headline={copy.tagline}
              kicker={copy.coverKicker}
              sub={copy.coverSub}
              action={copy.start}
            />
          ) : null}
          {screen === 'ending-ok' ? (
            <Cover
              tone="salmon"
              headline={copy.endings.matched.headline}
              sub={copy.endings.matched.body}
            />
          ) : null}
          {screen === 'ending-no' ? (
            <Cover
              tone="maroon"
              headline={copy.endings.declined.headline}
              sub={copy.endings.declined.body}
            />
          ) : null}
          {screen === 'ending-age' ? (
            <Cover
              tone="maroon"
              headline={copy.endings.under18.headline}
              sub={copy.endings.under18.body}
            />
          ) : null}
          {typeof screen === 'number' ? (
            <FormShell
              page={screen}
              onBack={() => backFromPage(screen)}
              onContinue={() => continueFromPage(screen)}
              continueLabel={screen === 9 ? copy.submit : copy.continue}
              pending={pending}
              submitError={submitError}
            >
              <PageBody
                page={screen}
                values={values}
                errors={errors}
                emailWarn={emailWarn}
                patch={patch}
              />
            </FormShell>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Cover({
  headline,
  kicker,
  sub,
  action,
  onStart,
  tone = 'salmon',
}: {
  headline: string
  kicker?: string
  sub?: string
  action?: string
  onStart?: () => void
  tone?: 'salmon' | 'maroon'
}) {
  const bg = tone === 'maroon' ? 'bg-maroon' : 'bg-salmon'
  return (
    <section
      className={[
        'relative flex min-h-[100dvh] w-full min-w-0 flex-col overflow-x-hidden px-6 py-10 text-white md:px-10',
        bg,
      ].join(' ')}
    >
      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-open-sauce w-full min-w-0 text-[clamp(2.35rem,9vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.035em]">
          {headline}
        </h1>
        {kicker ? (
          <p className="font-open-sauce mt-5 w-full min-w-0 text-[1.05rem] font-medium tracking-tight md:text-[1.35rem]">
            {kicker}
          </p>
        ) : null}
        {sub ? (
          <p className="font-open-sauce mt-4 w-full min-w-0 max-w-[34rem] text-[1.02rem] font-normal leading-relaxed text-white/90 md:text-[1.125rem]">
            {sub}
          </p>
        ) : null}
        {onStart && action ? (
          <button
            type="button"
            onClick={onStart}
            className="mt-10 min-h-12 rounded-xl bg-maroon px-8 py-3.5 font-open-sauce text-base font-bold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110 active:scale-[0.98]"
          >
            {action}
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-center gap-2.5 pb-2">
        <TestRunMark
          variant="white"
          knockout="#4A1525"
          className="h-14 w-14 md:h-16 md:w-16"
        />
        <span className="font-open-sauce text-sm font-medium tracking-tight">
          {copy.brand}
        </span>
      </div>
    </section>
  )
}

function FormShell({
  page,
  onBack,
  onContinue,
  continueLabel,
  pending,
  submitError,
  children,
}: {
  page: number
  onBack: () => void
  onContinue: () => void
  continueLabel: string
  pending: boolean
  submitError?: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-10 md:px-6">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TestRunMark />
          <span className="font-open-sauce text-sm font-medium tracking-tight text-maroon">
            {copy.brand}
          </span>
        </div>
        <p className="font-open-sauce text-sm font-medium text-dusty">
          {page} / 9
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-8">{children}</div>

      {submitError ? (
        <p role="alert" className="mt-6 text-sm font-medium text-maroon">
          {submitError}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dusty/15 bg-cream px-5 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-12 rounded-xl px-4 font-open-sauce text-sm font-medium text-grey transition-colors hover:text-maroon"
          >
            {copy.back}
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={pending}
            className="min-h-12 flex-1 rounded-xl bg-maroon px-5 font-open-sauce text-base font-bold text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? copy.submitting : continueLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function PageBody({
  page,
  values,
  errors,
  emailWarn,
  patch,
}: {
  page: number
  values: TestRunFormState
  errors: ReturnType<typeof validateTestRunPage>
  emailWarn: string | null
  patch: (next: Partial<TestRunFormState>) => void
}) {
  const p = copy.pages

  if (page === 1) {
    return (
      <>
        <div className="flex flex-col gap-3">
          <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
            {p[1].title}
          </h1>
          <Statement>{p[1].statement}</Statement>
        </div>
        <CheckRow
          checked={values.consent}
          onChange={(consent) => patch({ consent })}
          error={errors.consent}
        >
          {p[1].consent}
        </CheckRow>
        <p className="-mt-1 text-sm text-grey">{p[1].consentHelper}</p>
        <Question title={p[1].wantIn} helper={p[1].wantInHelper} error={errors.wantIn}>
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
      </>
    )
  }

  if (page === 2) {
    return (
      <>
        <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
          {p[2].title}
        </h1>
        <Question title={p[2].campus} htmlFor="campus" helper={p[2].campusHelper} error={errors.campus}>
          <TextInput
            id="campus"
            name="campus"
            autoComplete="organization"
            value={values.campus}
            invalid={Boolean(errors.campus)}
            onChange={(event) => patch({ campus: event.target.value })}
          />
        </Question>
        <Question title={p[2].city} htmlFor="cityCorridor" helper={p[2].cityHelper} error={errors.cityCorridor}>
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
        {values.cityCorridor === 'Other' ? (
          <Question
            title={p[2].cityOther}
            htmlFor="cityCorridorOther"
            error={errors.cityCorridorOther}
          >
            <TextInput
              id="cityCorridorOther"
              value={values.cityCorridorOther}
              invalid={Boolean(errors.cityCorridorOther)}
              onChange={(event) => patch({ cityCorridorOther: event.target.value })}
            />
          </Question>
        ) : null}
      </>
    )
  }

  if (page === 3) {
    return (
      <>
        <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
          {p[3].title}
        </h1>
        <Question title={p[3].fullName} htmlFor="fullName" error={errors.fullName}>
          <TextInput
            id="fullName"
            autoComplete="name"
            value={values.fullName}
            invalid={Boolean(errors.fullName)}
            onChange={(event) => patch({ fullName: event.target.value })}
          />
        </Question>
        <Question title={p[3].age} htmlFor="age" helper={p[3].ageHelper} error={errors.age}>
          <TextInput
            id="age"
            inputMode="numeric"
            pattern="[0-9]*"
            value={values.age}
            invalid={Boolean(errors.age)}
            onChange={(event) => patch({ age: event.target.value.replace(/[^\d]/g, '') })}
          />
        </Question>
        <Question title={p[3].email} htmlFor="email" helper={p[3].emailHelper} error={errors.email}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            invalid={Boolean(errors.email)}
            onChange={(event) => patch({ email: event.target.value })}
          />
          {emailWarn ? <p className="text-sm font-medium text-dusty">{emailWarn}</p> : null}
        </Question>
        <Question title={p[3].phone} htmlFor="phone" helper={p[3].phoneHelper} error={errors.phone}>
          <TextInput
            id="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            invalid={Boolean(errors.phone)}
            onChange={(event) => patch({ phone: event.target.value })}
          />
        </Question>
        <Question
          title={p[3].socials}
          htmlFor="socials"
          helper={p[3].socialsHelper}
          optional
        >
          <TextInput
            id="socials"
            value={values.socials}
            placeholder="IG handle, etc."
            onChange={(event) => patch({ socials: event.target.value })}
          />
        </Question>
        <Question title={p[3].contact} error={errors.contactPreference}>
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
      </>
    )
  }

  if (page === 4) {
    return (
      <>
        <div className="flex flex-col gap-3">
          <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
            {p[4].title}
          </h1>
          <Statement>{p[4].statement}</Statement>
        </div>
        <Question title={p[4].face} helper={p[4].faceHelper} error={errors.facePhoto}>
          <FilePick
            id="facePhoto"
            label={copy.uploadPrompt}
            file={values.facePhoto}
            onChange={(facePhoto) => patch({ facePhoto })}
          />
        </Question>
        <Question title={p[4].schoolId} helper={p[4].schoolIdHelper} error={errors.schoolIdPhoto}>
          <FilePick
            id="schoolIdPhoto"
            label={copy.uploadPrompt}
            file={values.schoolIdPhoto}
            onChange={(schoolIdPhoto) => patch({ schoolIdPhoto })}
          />
        </Question>
        <CheckRow
          checked={values.isMe}
          onChange={(isMe) => patch({ isMe })}
          error={errors.isMe}
        >
          {p[4].isMe}
        </CheckRow>
      </>
    )
  }

  if (page === 5) {
    return (
      <>
        <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
          {p[5].title}
        </h1>
        <Question title={p[5].gender} error={errors.gender}>
          <ChoiceRow>
            {copy.genderOptions.map((option) => (
              <ChoiceButton
                key={option}
                selected={values.gender === option}
                onClick={() => patch({ gender: option })}
              >
                {option}
              </ChoiceButton>
            ))}
          </ChoiceRow>
        </Question>
        {values.gender === 'Self-describe' ? (
          <Question title={p[5].genderOther} htmlFor="genderOther" error={errors.genderOther}>
            <TextInput
              id="genderOther"
              value={values.genderOther}
              invalid={Boolean(errors.genderOther)}
              onChange={(event) => patch({ genderOther: event.target.value })}
            />
          </Question>
        ) : null}
        <Question title={p[5].meet} error={errors.meetGenders}>
          <ChoiceRow>
            {copy.meetOptions.map((option) => {
              const selected = values.meetGenders.includes(option)
              return (
                <ChoiceButton
                  key={option}
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
        <Question title={p[5].school} htmlFor="school" error={errors.school}>
          <TextInput
            id="school"
            value={values.school}
            invalid={Boolean(errors.school)}
            onChange={(event) => patch({ school: event.target.value })}
          />
        </Question>
        <Question title={p[5].year} htmlFor="yearLevel" error={errors.yearLevel}>
          <SelectInput
            id="yearLevel"
            value={values.yearLevel}
            invalid={Boolean(errors.yearLevel)}
            onChange={(event) => patch({ yearLevel: event.target.value })}
          >
            <option value="">Choose one</option>
            {copy.yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectInput>
        </Question>
        <Question title={p[5].area} htmlFor="departureArea" helper={p[5].areaHelper} error={errors.departureArea}>
          <TextInput
            id="departureArea"
            value={values.departureArea}
            invalid={Boolean(errors.departureArea)}
            onChange={(event) => patch({ departureArea: event.target.value })}
          />
        </Question>
        <Question title={p[5].travel} error={errors.maxTravel}>
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
        <Question title={p[5].nearby} error={errors.nearbySchoolOk}>
          <ChoiceRow>
            <ChoiceButton
              selected={values.nearbySchoolOk === 'yes'}
              onClick={() => patch({ nearbySchoolOk: 'yes' })}
            >
              {copy.yes}
            </ChoiceButton>
            <ChoiceButton
              selected={values.nearbySchoolOk === 'no'}
              onClick={() => patch({ nearbySchoolOk: 'no' })}
            >
              {copy.no}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
        <Question
          title={p[5].dealbreakers}
          htmlFor="dealbreakers"
          helper={p[5].dealbreakersHelper}
          error={errors.dealbreakers}
        >
          <TextArea
            id="dealbreakers"
            value={values.dealbreakers}
            invalid={Boolean(errors.dealbreakers)}
            onChange={(event) => patch({ dealbreakers: event.target.value })}
          />
        </Question>
        <Question title={p[5].about} htmlFor="aboutYou" error={errors.aboutYou}>
          <TextArea
            id="aboutYou"
            value={values.aboutYou}
            invalid={Boolean(errors.aboutYou)}
            onChange={(event) => patch({ aboutYou: event.target.value })}
          />
        </Question>
        <Question title={p[5].cafes} htmlFor="preferredCafes" optional>
          <TextInput
            id="preferredCafes"
            value={values.preferredCafes}
            onChange={(event) => patch({ preferredCafes: event.target.value })}
          />
        </Question>
        <Question title={p[5].refuse} htmlFor="refuseAreas" optional>
          <TextInput
            id="refuseAreas"
            value={values.refuseAreas}
            onChange={(event) => patch({ refuseAreas: event.target.value })}
          />
        </Question>
        <Question title={p[5].cover} helper={p[5].coverHelper} error={errors.coverOwnOrder}>
          <ChoiceRow>
            <ChoiceButton
              selected={values.coverOwnOrder === 'yes'}
              onClick={() => patch({ coverOwnOrder: 'yes' })}
            >
              {copy.yes}
            </ChoiceButton>
            <ChoiceButton
              selected={values.coverOwnOrder === 'no'}
              onClick={() => patch({ coverOwnOrder: 'no' })}
            >
              {copy.no}
            </ChoiceButton>
          </ChoiceRow>
        </Question>
        <Question title={p[5].access} htmlFor="accessibility" optional>
          <TextInput
            id="accessibility"
            value={values.accessibility}
            onChange={(event) => patch({ accessibility: event.target.value })}
          />
        </Question>
      </>
    )
  }

  if (page === 6) {
    return (
      <>
        <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
          {p[6].title}
        </h1>
        <Question title={p[6].when} htmlFor="schedule" helper={p[6].whenHelper} error={errors.schedule}>
          <TextArea
            id="schedule"
            value={values.schedule}
            invalid={Boolean(errors.schedule)}
            onChange={(event) => patch({ schedule: event.target.value })}
          />
        </Question>
        <Question title={p[6].hardNos} htmlFor="hardNos" helper={p[6].hardNosHelper} optional>
          <TextArea
            id="hardNos"
            value={values.hardNos}
            onChange={(event) => patch({ hardNos: event.target.value })}
          />
        </Question>
      </>
    )
  }

  if (page === 7) {
    return (
      <>
        <div className="flex flex-col gap-3">
          <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
            {p[7].title}
          </h1>
          <Statement>{p[7].statement}</Statement>
        </div>
        <CheckRow
          checked={values.understandEarly}
          onChange={(understandEarly) => patch({ understandEarly })}
          error={errors.understandEarly}
        >
          {p[7].understandEarly}
        </CheckRow>
        <CheckRow
          checked={values.publicCafe}
          onChange={(publicCafe) => patch({ publicCafe })}
          error={errors.publicCafe}
        >
          {p[7].publicCafe}
        </CheckRow>
        <CheckRow
          checked={values.cancelEarly}
          onChange={(cancelEarly) => patch({ cancelEarly })}
          error={errors.cancelEarly}
        >
          {p[7].cancelEarly}
        </CheckRow>
        <CheckRow
          checked={values.canReport}
          onChange={(canReport) => patch({ canReport })}
          error={errors.canReport}
        >
          {p[7].canReport}
        </CheckRow>
        <CheckRow
          checked={values.interviewOk}
          onChange={(interviewOk) => patch({ interviewOk })}
        >
          {p[7].interview}
        </CheckRow>
        <Question
          title={p[7].emergencyName}
          htmlFor="emergencyName"
          helper={p[7].emergencyNameHelper}
          optional
        >
          <TextInput
            id="emergencyName"
            autoComplete="off"
            value={values.emergencyName}
            onChange={(event) => patch({ emergencyName: event.target.value })}
          />
        </Question>
        <Question
          title={p[7].emergencyPhone}
          htmlFor="emergencyPhone"
          helper={p[7].emergencyHelper}
          optional
        >
          <TextInput
            id="emergencyPhone"
            type="tel"
            autoComplete="off"
            value={values.emergencyPhone}
            onChange={(event) => patch({ emergencyPhone: event.target.value })}
          />
        </Question>
      </>
    )
  }

  if (page === 8) {
    return (
      <>
        <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
          {p[8].title}
        </h1>
        <ul className="flex flex-col gap-3">
          {p[8].lines.map((line) => (
            <li
              key={line}
              className="font-open-sauce text-[1.02rem] font-medium leading-relaxed text-charcoal"
            >
              {line}
            </li>
          ))}
        </ul>
        <CheckRow
          checked={values.understandData}
          onChange={(understandData) => patch({ understandData })}
          error={errors.understandData}
        >
          {p[8].understand}
        </CheckRow>
      </>
    )
  }

  return (
    <>
      <h1 className="font-open-sauce text-[1.5rem] font-bold tracking-tight text-maroon md:text-[1.75rem]">
        {p[9].title}
      </h1>
      <CheckRow
        checked={values.everythingTrue}
        onChange={(everythingTrue) => patch({ everythingTrue })}
        error={errors.everythingTrue}
      >
        {p[9].truth}
      </CheckRow>
      <Question title={p[9].howHeard} htmlFor="howHeard" optional>
        <TextInput
          id="howHeard"
          value={values.howHeard}
          onChange={(event) => patch({ howHeard: event.target.value })}
        />
      </Question>
    </>
  )
}
