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