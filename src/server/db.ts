const dbFileUrl = new URL('../data/db.json', import.meta.url)

export async function dbFileExists(): Promise<boolean> {
  const { access } = await import('node:fs/promises')

  try {
    await access(dbFileUrl)
    return true
  } catch {
    return false
  }
}

async function readDb(): Promise<Database> {
  const { readFile } = await import('node:fs/promises')
  const data = await readFile(dbFileUrl, 'utf-8')
  return JSON.parse(data) as Database
}

async function writeDb(data: Database) {
  const { writeFile } = await import('node:fs/promises')
  await writeFile(dbFileUrl, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

export interface Project {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Snippet {
  id: number
  title: string
  description: string
  language: string
  code: string
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: number
  title: string
  content: string
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface Link {
  id: number
  title: string
  url: string
  description: string
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  projectId: number
  createdAt: string
  updatedAt: string
}

export interface Database {
  projects: Project[]
  snippets: Snippet[]
  notes: Note[]
  links: Link[]
  tags: Tag[]
}

export interface ProjectListItem extends Project {
  tags: Tag[]
  _count: {
    snippets: number
    notes: number
    links: number
  }
}

export interface ProjectDetail extends Project {
  tags: Tag[]
  snippets: Snippet[]
  notes: Note[]
  links: Link[]
  _count: {
    snippets: number
    notes: number
    links: number
  }
}

function getNextId(items: { id: number }[]) {
  return items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1
}

export async function getProjects(): Promise<ProjectListItem[]> {
  const db = await readDb()

  return db.projects.map((project) => ({
    ...project,
    tags: db.tags.filter((tag) => tag.projectId === project.id),
    _count: {
      snippets: db.snippets.filter((snippet) => snippet.projectId === project.id).length,
      notes: db.notes.filter((note) => note.projectId === project.id).length,
      links: db.links.filter((link) => link.projectId === project.id).length,
    },
  }))
}

export async function getProjectById(id: number): Promise<ProjectDetail | null> {
  const db = await readDb()
  const project = db.projects.find((project) => project.id === id)

  if (!project) {
    return null
  }

  const snippets = db.snippets.filter((snippet) => snippet.projectId === id)
  const notes = db.notes.filter((note) => note.projectId === id)
  const links = db.links.filter((link) => link.projectId === id)
  const tags = db.tags.filter((tag) => tag.projectId === id)

  return {
    ...project,
    snippets,
    notes,
    links,
    tags,
    _count: {
      snippets: snippets.length,
      notes: notes.length,
      links: links.length,
    },
  }
}

export async function createSnippet(data: {
  title: string
  description: string
  language: string
  code: string
  projectId: number
}): Promise<Snippet> {
  const db = await readDb()
  const now = new Date().toISOString()
  const snippet: Snippet = {
    id: getNextId(db.snippets),
    title: data.title,
    description: data.description,
    language: data.language,
    code: data.code,
    projectId: data.projectId,
    createdAt: now,
    updatedAt: now,
  }

  db.snippets.push(snippet)
  const project = db.projects.find((project) => project.id === data.projectId)
  if (project) {
    project.updatedAt = now
  }

  await writeDb(db)
  return snippet
}

export async function createNote(data: {
  title: string
  content: string
  projectId: number
}): Promise<Note> {
  const db = await readDb()
  const now = new Date().toISOString()
  const note: Note = {
    id: getNextId(db.notes),
    title: data.title,
    content: data.content,
    projectId: data.projectId,
    createdAt: now,
    updatedAt: now,
  }

  db.notes.push(note)
  const project = db.projects.find((project) => project.id === data.projectId)
  if (project) {
    project.updatedAt = now
  }

  await writeDb(db)
  return note
}

export async function createLink(data: {
  title: string
  url: string
  description: string
  projectId: number
}): Promise<Link> {
  const db = await readDb()
  const now = new Date().toISOString()
  const link: Link = {
    id: getNextId(db.links),
    title: data.title,
    url: data.url,
    description: data.description,
    projectId: data.projectId,
    createdAt: now,
    updatedAt: now,
  }

  db.links.push(link)
  const project = db.projects.find((project) => project.id === data.projectId)
  if (project) {
    project.updatedAt = now
  }

  await writeDb(db)
  return link
}

export async function createProject(data: { name: string; description: string }): Promise<Project> {
  const db = await readDb()
  const now = new Date().toISOString()
  const project: Project = {
    id: getNextId(db.projects),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  }

  db.projects.push(project)
  await writeDb(db)
  return project
}

export async function updateProject(
  id: number,
  data: { name: string; description: string }
): Promise<Project> {
  const db = await readDb()
  const project = db.projects.find((project) => project.id === id)

  if (!project) {
    throw new Error(`Project with id ${id} not found`)
  }

  project.name = data.name
  project.description = data.description
  project.updatedAt = new Date().toISOString()

  await writeDb(db)
  return project
}

export async function deleteProject(id: number): Promise<void> {
  const db = await readDb()

  db.projects = db.projects.filter((project) => project.id !== id)
  db.tags = db.tags.filter((tag) => tag.projectId !== id)
  db.snippets = db.snippets.filter((snippet) => snippet.projectId !== id)
  db.notes = db.notes.filter((note) => note.projectId !== id)
  db.links = db.links.filter((link) => link.projectId !== id)

  await writeDb(db)
}
