import { createFileRoute } from '@tanstack/react-router';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from '#/components/ui/button';
import { Code, Folder, Infinity, Link, Plus, Pencil, Trash2 } from 'lucide-react';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react';
import { formatDistance } from "date-fns";
import { enUS } from "date-fns/locale";
import type { ProjectListItem } from '#/db';

type CreateProjectInput = {
  name: string
  description: string
}

type UpdateProjectInput = {
  id: number
  name: string
  description: string
}

const getProjectsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getProjects, dbFileExists } = await import('#/server/db')
  if (!(await dbFileExists())) {
    return false
  }
  return getProjects()
});

const createProjectFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateProjectInput) => data)
  .handler(async ({ data }) => {
    const { createProject } = await import('#/server/db')
    return createProject(data)
  })

const updateProjectFn = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateProjectInput) => data)
  .handler(async ({ data }) => {
    const { updateProject } = await import('#/server/db')
    return updateProject(data.id, {
      name: data.name,
      description: data.description,
    })
  })

const deleteProjectFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const { deleteProject } = await import('#/server/db')
    await deleteProject(data.id)
    return { id: data.id }
  })

export const Route = createFileRoute('/dashboard/project')({
  component: RouteComponent,
  loader: async () => getProjectsFn(),
})

function RouteComponent() {
  const initialProjects = Route.useLoaderData() as ProjectListItem[] | false
  const [projects, setProjects] = useState<ProjectListItem[]>(
    Array.isArray(initialProjects) ? initialProjects : []
  )
  const [dbMissing, setDbMissing] = useState(initialProjects === false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const createProjectMutation = useServerFn(createProjectFn)
  const updateProjectMutation = useServerFn(updateProjectFn)
  const deleteProjectMutation = useServerFn(deleteProjectFn)

  useEffect(() => {
    if (Array.isArray(initialProjects)) {
      setProjects(initialProjects)
      setDbMissing(false)
    } else {
      setDbMissing(true)
    }
  }, [initialProjects])

  const createForm = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const project = await createProjectMutation({ data: value })
      setProjects((current) => [
        ...current,
        {
          ...project,
          tags: [],
          _count: { snippets: 0, notes: 0, links: 0 },
        },
      ])
      createForm.reset()
      setCreateDialogOpen(false)
    },
  })

  const editForm = useForm({
    defaultValues: {
      id: 0,
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const project = await updateProjectMutation({ data: value as UpdateProjectInput })
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? {
                ...item,
                name: project.name,
                description: project.description,
                updatedAt: project.updatedAt,
              }
            : item
        )
      )
      setEditDialogOpen(false)
    },
  })

  const openEditDialog = (project: ProjectListItem) => {
    editForm.reset({
      id: project.id,
      name: project.name,
      description: project.description,
    })
    setEditDialogOpen(true)
  }

  const handleDeleteProject = async (project: ProjectListItem) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) {
      return
    }

    await deleteProjectMutation({ data: { id: project.id } })
    setProjects((current) => current.filter((item) => item.id !== project.id))
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-5xl font-bold">Projects</h1>
          <p className="mt-4 max-w-2xl text-balance">
            Manage your technical knowledge ecosystem. Centralized snippets,
            architectural notes, and critical resources organized by project.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            {projects.length === 0 && !dbMissing ? (
              ''
            ) : (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="size-4" /> New Project
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                createForm.handleSubmit()
              }}
            >
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <FieldGroup>
                <createForm.Field name="name">
                  {(field) => (
                    <Field>
                      <Label htmlFor={field.name}>Project Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Name"
                      />
                    </Field>
                  )}
                </createForm.Field>

                <createForm.Field name="description">
                  {(field) => (
                    <Field>
                      <Label htmlFor={field.name}>Project Description</Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Brief overview of project"
                      />
                    </Field>
                  )}
                </createForm.Field>
              </FieldGroup>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              editForm.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <editForm.Field name="name">
                {(field) => (
                  <Field>
                    <Label htmlFor={field.name}>Project Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Name"
                    />
                  </Field>
                )}
              </editForm.Field>

              <editForm.Field name="description">
                {(field) => (
                  <Field>
                    <Label htmlFor={field.name}>Project Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Brief overview of project"
                    />
                  </Field>
                )}
              </editForm.Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Update Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {projects.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 rounded-3xl border border-white/10 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]  bg-(--project-accent)"
            >
              <CardHeader className="gap-4">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl text-black shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)]">
                    <Code className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-white">{project.name}</CardTitle>
                    <CardDescription className="max-w-sm text-sm text-slate-300">{project.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag.id} className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">{tag.name}</span>
                  ))}
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">React</span>
                </div>
              </CardContent>
              <CardFooter className="justify-between gap-4 border-t border-white/10 pt-4 text-sm text-slate-400">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Updated</span>
                  <span>{formatDistance(new Date(project.updatedAt), new Date(), { locale: enUS })} ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </CardFooter>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-200">
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-200">
                  <Code className="size-4" color="#fff" /> {project._count.snippets}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-200">
                  <Link className="size-4" color="#fff" /> {project._count.links}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-200">
                  <Infinity className="size-4" color="#fff" /> {project._count.notes}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="default">
              <Folder className='size-12' color='#325305' />
            </EmptyMedia>
            <EmptyTitle className='text-4xl'>No projects yet</EmptyTitle>
            <EmptyDescription>Create your first project to start saving snippets, notes,
              and links in your digital terminal.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size={'lg'} className='h-10 px-4 text-xl' onClick={() => setCreateDialogOpen(true)}>
              <Plus /> Create Project
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
