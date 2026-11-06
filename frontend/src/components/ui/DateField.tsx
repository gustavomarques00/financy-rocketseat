import { useEffect, useId, useRef, useState } from 'react'

type DateFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function parseInputDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return null
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function monthCells(year: number, month: number): Array<Date | null> {
  const firstWeekday = new Date(year, month, 1).getDay()
  const count = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(year, month, day))
  }
  return cells
}

function formatLong(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function DateField({ id, value, onChange }: DateFieldProps) {
  const dialogId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = parseInputDate(value)
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1),
  )
  const [focusDate, setFocusDate] = useState<Date>(selected ?? today)

  useEffect(() => {
    if (!open) {
      return
    }

    const node = rootRef.current?.querySelector<HTMLButtonElement>(
      `[data-date="${toInputDate(focusDate)}"]`,
    )
    node?.focus()
  }, [open, focusDate, visibleMonth])

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  function openCalendar() {
    const base = selected ?? new Date()
    setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1))
    setFocusDate(base)
    setOpen(true)
  }

  function selectDate(date: Date) {
    onChange(toInputDate(date))
    setOpen(false)
    rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  function moveFocus(amount: number) {
    const next = addDays(focusDate, amount)
    setFocusDate(next)
    setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }

  const monthLabel = visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`
  const buttonLabel = selected
    ? `Abrir calendário, ${formatLong(selected)}`
    : 'Abrir calendário, nenhuma data selecionada'

  return (
    <div className="date-field" ref={rootRef}>
      <button
        id={id}
        type="button"
        className="field-control date-field-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={buttonLabel}
        onClick={() => (open ? setOpen(false) : openCalendar())}
      >
        {selected ? selected.toLocaleDateString('pt-BR') : 'Selecione'}
      </button>
      {open ? (
        <div
          id={dialogId}
          className="calendar-popover"
          role="dialog"
          aria-label="Calendário"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              setOpen(false)
              rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
            }
          }}
        >
          <div className="calendar-header">
            <button type="button" className="icon-button" aria-label="Mês anterior" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
              ‹
            </button>
            <p data-calendar-month={monthKey}>
              {monthLabel.charAt(0).toUpperCase()}
              {monthLabel.slice(1)}
            </p>
            <button type="button" className="icon-button" aria-label="Próximo mês" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
              ›
            </button>
          </div>
          <button
            type="button"
            className="text-link calendar-today"
            onClick={() => {
              const now = new Date()
              setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1))
              setFocusDate(now)
            }}
          >
            Mês atual
          </button>
          <div className="calendar-grid" role="grid" aria-label={monthLabel}>
            {WEEKDAYS.map((label, index) => (
              <span key={`${label}-${index}`} className="calendar-weekday" aria-hidden="true">
                {label}
              </span>
            ))}
            {monthCells(visibleMonth.getFullYear(), visibleMonth.getMonth()).map((date, index) =>
              date ? (
                <button
                  key={toInputDate(date)}
                  type="button"
                  role="gridcell"
                  data-date={toInputDate(date)}
                  className={`calendar-day${selected && sameDay(date, selected) ? ' is-selected' : ''}${sameDay(date, today) ? ' is-today' : ''}`}
                  aria-label={formatLong(date)}
                  aria-selected={Boolean(selected && sameDay(date, selected))}
                  onClick={() => selectDate(date)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') {
                      event.preventDefault()
                      moveFocus(1)
                    } else if (event.key === 'ArrowLeft') {
                      event.preventDefault()
                      moveFocus(-1)
                    } else if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      moveFocus(7)
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      moveFocus(-7)
                    } else if (event.key === 'Escape') {
                      event.preventDefault()
                      setOpen(false)
                      rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
                    } else if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectDate(date)
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
