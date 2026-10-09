import { api } from "../api";
import type {
  CreateTimetablePayload,
  UpdateTimetableEntryPayload,
  TimetableEntry,
} from "../../types/timetable";

/**
 * Fetch the complete timetable for a specific section.
 * Endpoint: GET /sections/:sectionId/timetable
 */
export const getSectionTimetable = async (
  sectionId: number | string
): Promise<{ success: boolean; data: TimetableEntry[]; message?: string }> => {
  const response = await api.get(`/class/sections/${sectionId}/timetable`);
  const raw = response.data;

  let items: TimetableEntry[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if (Array.isArray(raw?.data)) {
    items = raw.data;
  } else if (Array.isArray(raw?.entries)) {
    items = raw.entries;
  } else if (Array.isArray(raw?.timetable)) {
    items = raw.timetable;
  } else if (Array.isArray(raw?.items)) {
    items = raw.items;
  }

  return {
    success: true,
    data: items,
    message: raw?.message,
  };
};

/**
 * Save multiple timetable periods for a section in a single payload.
 * Endpoint: POST /sections/:sectionId/timetable
 */
export const createSectionTimetable = async (
  sectionId: number | string,
  payload: CreateTimetablePayload
): Promise<any> => {
  const response = await api.post(`class/sections/${sectionId}/timetable`, payload);
  return response.data;
};

/**
 * Update an individual timetable entry.
 * Endpoint: PATCH /timetable/:entryId
 */
export const updateTimetableEntry = async (
  entryId: number | string,
  payload: UpdateTimetableEntryPayload
): Promise<any> => {
  const response = await api.patch(`class/sections/timetable/${entryId}`, payload);
  return response.data;
};

/**
 * Delete an individual timetable entry.
 * Endpoint: DELETE /timetable/:entryId
 */
export const deleteTimetableEntry = async (
  entryId: number | string
): Promise<any> => {
  const response = await api.delete(`class/sections/timetable/${entryId}`);
  return response.data;
};
