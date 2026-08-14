import { useQuery } from '@tanstack/react-query'
import { getPatientById, listPatients } from '@/services/patients.service'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: listPatients,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => getPatientById(id!),
    enabled: Boolean(id),
  })
}
