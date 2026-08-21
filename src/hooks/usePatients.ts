import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPatient,
  getPatientById,
  listPatients,
  updatePatient,
} from '@/services/patients.service'
import type { CreatePatientInput, UpdatePatientInput } from '@/types/patient'
import { toast } from '@/stores/toast.store'

function onError(error: unknown) {
  toast(error instanceof Error ? error.message : 'Erro inesperado', 'error')
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: listPatients,
    staleTime: 60_000,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => getPatientById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePatientInput) => createPatient(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
      toast('Paciente cadastrado', 'success')
    },
    onError,
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePatientInput }) => updatePatient(id, input),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
      void qc.invalidateQueries({ queryKey: ['patients', variables.id] })
      toast('Ficha atualizada', 'success')
    },
    onError,
  })
}
