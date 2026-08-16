import { supabase } from '@/lib/supabase/client'

export interface BoardColumn {
  id: string
  title: string
  sortOrder: number
}

export interface BoardCard {
  id: string
  columnId: string
  title: string
  description: string
  patientId: string | null
  patientName: string | null
  photoTone: string | null
  dueOn: string | null
  sortOrder: number
}

export interface DueBoardCard {
  id: string
  title: string
  dueOn: string
  patientName: string | null
  photoTone: string | null
  columnTitle: string
  done: boolean
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function listBoard() {
  const { data: columns, error: columnsError } = await supabase
    .from('board_columns')
    .select('id, title, sort_order')
    .order('sort_order', { ascending: true })

  throwIfError(columnsError)

  const { data: cards, error: cardsError } = await supabase
    .from('board_cards')
    .select('id, column_id, title, description, patient_id, due_on, sort_order, patients(full_name, photo_tone)')
    .order('sort_order', { ascending: true })

  throwIfError(cardsError)

  return {
    columns: ((columns ?? []) as Array<{ id: string; title: string; sort_order: number }>).map((column) => ({
      id: column.id,
      title: column.title,
      sortOrder: column.sort_order,
    })),
    cards: ((cards ?? []) as Array<{
      id: string
      column_id: string
      title: string
      description: string | null
      patient_id: string | null
      due_on: string | null
      sort_order: number
      patients: { full_name: string; photo_tone: string } | { full_name: string; photo_tone: string }[] | null
    }>).map((card) => {
      const patient = Array.isArray(card.patients) ? card.patients[0] : card.patients
      return {
        id: card.id,
        columnId: card.column_id,
        title: card.title,
        description: card.description ?? '',
        patientId: card.patient_id,
        patientName: patient?.full_name ?? null,
        photoTone: patient?.photo_tone ?? null,
        dueOn: card.due_on ? card.due_on.slice(0, 10) : null,
        sortOrder: card.sort_order,
      }
    }),
  }
}

export async function createColumn(title: string) {
  const { data: last } = await supabase
    .from('board_columns')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('board_columns').insert({
    title,
    sort_order: (last?.sort_order ?? -1) + 1,
  })
  throwIfError(error)
}

export async function createCard(input: {
  columnId: string
  title: string
  description?: string
  patientId?: string | null
  dueOn?: string | null
}) {
  const { data: last } = await supabase
    .from('board_cards')
    .select('sort_order')
    .eq('column_id', input.columnId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('board_cards').insert({
    column_id: input.columnId,
    title: input.title,
    description: input.description || null,
    patient_id: input.patientId || null,
    due_on: input.dueOn || null,
    sort_order: (last?.sort_order ?? -1) + 1,
  })
  throwIfError(error)
}

export async function updateCardDue(cardId: string, dueOn: string | null) {
  const { error } = await supabase.from('board_cards').update({ due_on: dueOn }).eq('id', cardId)
  throwIfError(error)
}

export async function listDueCards(fromDate: string, toDate: string): Promise<DueBoardCard[]> {
  const [{ data, error }, { data: columns, error: columnsError }] = await Promise.all([
    supabase
      .from('board_cards')
      .select('id, title, due_on, column_id, patients(full_name, photo_tone)')
      .not('due_on', 'is', null)
      .gte('due_on', fromDate)
      .lt('due_on', toDate)
      .order('due_on', { ascending: true }),
    supabase.from('board_columns').select('id, title'),
  ])

  throwIfError(error)
  throwIfError(columnsError)

  const titles = new Map(
    ((columns ?? []) as Array<{ id: string; title: string }>).map((column) => [column.id, column.title]),
  )

  return ((data ?? []) as Array<{
    id: string
    title: string
    due_on: string | null
    column_id: string
    patients: { full_name: string; photo_tone: string } | { full_name: string; photo_tone: string }[] | null
  }>)
    .filter((row) => row.due_on)
    .map((row) => {
      const patient = Array.isArray(row.patients) ? row.patients[0] : row.patients
      const columnTitle = titles.get(row.column_id) ?? ''
      return {
        id: row.id,
        title: row.title,
        dueOn: (row.due_on as string).slice(0, 10),
        patientName: patient?.full_name ?? null,
        photoTone: patient?.photo_tone ?? null,
        columnTitle,
        done: columnTitle.toLowerCase().includes('conclu'),
      }
    })
}

export async function moveCard(cardId: string, columnId: string) {
  const { data: last } = await supabase
    .from('board_cards')
    .select('sort_order')
    .eq('column_id', columnId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('board_cards')
    .update({ column_id: columnId, sort_order: (last?.sort_order ?? -1) + 1 })
    .eq('id', cardId)

  throwIfError(error)
}

export async function deleteCard(id: string) {
  const { error } = await supabase.from('board_cards').delete().eq('id', id)
  throwIfError(error)
}

export async function deleteColumn(id: string) {
  const { error } = await supabase.from('board_columns').delete().eq('id', id)
  throwIfError(error)
}
