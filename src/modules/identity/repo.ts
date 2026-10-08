import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { universities, faculties, departments } from "@/lib/db/schema";

export async function listUniversities() {
  return db
    .select({
      id: universities.id,
      name: universities.name,
      shortName: universities.shortName,
    })
    .from(universities)
    .where(eq(universities.isActive, true))
    .orderBy(asc(universities.name));
}

export async function listFaculties(universityId: string) {
  return db
    .select({
      id: faculties.id,
      name: faculties.name,
    })
    .from(faculties)
    .where(eq(faculties.universityId, universityId))
    .orderBy(asc(faculties.name));
}

export async function listDepartments(facultyId: string) {
  return db
    .select({
      id: departments.id,
      name: departments.name,
    })
    .from(departments)
    .where(eq(departments.facultyId, facultyId))
    .orderBy(asc(departments.name));
}