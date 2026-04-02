import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ProjectDetail } from '#/db'

type CreateSnippetInput = {
  title: string
  description: string
  language: string
  code: string
  projectId: number
}

type CreateNoteInput = {
  title: string
  content: string
  projectId: number
}

type CreateLinkInput = {
  title: string
  url: string
  description: string
  projectId: number
}

const createSnippetFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateSnippetInput) => data)
  .handler(async ({ data }) => {
    const { createSnippet } = await import('#/server/db')
    return createSnippet(data)
  })

const createNoteFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateNoteInput) => data)
  .handler(async ({ data }) => {
    const { createNote } = await import('#/server/db')
    return createNote(data)
  })

const createLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateLinkInput) => data)
  .handler(async ({ data }) => {
    const { createLink } = await import('#/server/db')
    return createLink(data)
  })

export const Route = createFileRoute('/dashboard/project/$id')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const id = Number(params.id)
    if (isNaN(id)) {
      throw new Error(`Invalid project id: ${params.id}`)
    }

    const { getProjectById, dbFileExists } = await import('#/server/db')
    if (!(await dbFileExists())) {
      return null
    }

    return getProjectById(id)
  },
})

function RouteComponent() {
  const loaderData = Route.useLoaderData() as ProjectDetail | null
  const createSnippetMutation = useServerFn(createSnippetFn)
  const createNoteMutation = useServerFn(createNoteFn)
  const createLinkMutation = useServerFn(createLinkFn)

  const [snippets, setSnippets] = useState(loaderData?.snippets ?? [])
  const [notes, setNotes] = useState(loaderData?.notes ?? [])
  const [links, setLinks] = useState(loaderData?.links ?? [])
  const [snippetDialogOpen, setSnippetDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  const counts = useMemo(
    () => ({
      snippets: snippets.length,
      notes: notes.length,
      links: links.length,
    }),
    [snippets, notes, links]
  )

  const snippetForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      language: '',
      code: '',
      projectId: loaderData?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      const created = await createSnippetMutation({ data: value as CreateSnippetInput })
      setSnippets((current) => [...current, created])
      setSnippetDialogOpen(false)
    },
  })

  const noteForm = useForm({
    defaultValues: {
      title: '',
      content: '',
      projectId: loaderData?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      const created = await createNoteMutation({ data: value as CreateNoteInput })
      setNotes((current) => [...current, created])
      setNoteDialogOpen(false)
    },
  })

  const linkForm = useForm({
    defaultValues: {
      title: '',
      url: '',
      description: '',
      projectId: loaderData?.id ?? 0,
    },
    onSubmit: async ({ value }) => {
      const created = await createLinkMutation({ data: value as CreateLinkInput })
      setLinks((current) => [...current, created])
      setLinkDialogOpen(false)
    },
  })

  if (!loaderData) {
    return (
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Project not available</CardTitle>
            <CardDescription>
              The project data is unavailable right now. Make sure the JSON datastore is present
              and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If this keeps happening, verify that `src/data/db.json` exists and contains a valid
              project record.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">{loaderData.name}</h1>
        <p className="max-w-2xl text-balance">{loaderData.description}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Project metadata and related counts.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(loaderData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated</p>
                  <p>{new Date(loaderData.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Snippets</p>
                  <p>{counts.snippets}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p>{counts.notes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Links</p>
                  <p>{counts.links}</p>
                </div>
              </div>

              {loaderData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {loaderData.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-input px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snippets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Snippets</CardTitle>
                <CardDescription>Code snippets saved for this project.</CardDescription>
              </div>
              <Dialog open={snippetDialogOpen} onOpenChange={setSnippetDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Snippet</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      snippetForm.handleSubmit()
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Add Snippet</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                      <snippetForm.Field name="title">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Snippet title"
                            />
                          </Field>
                        )}
                      </snippetForm.Field>

                      <snippetForm.Field name="language">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Language</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="e.g. JavaScript"
                            />
                          </Field>
                        )}
                      </snippetForm.Field>

                      <snippetForm.Field name="description">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Description</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="What does this snippet do?"
                            />
                          </Field>
                        )}
                      </snippetForm.Field>

                      <snippetForm.Field name="code">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Code</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Paste the snippet code here"
                            />
                          </Field>
                        )}
                      </snippetForm.Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save Snippet</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {snippets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No snippets have been added yet.</p>
              ) : (
                <div className="space-y-4">
                  {snippets.map((snippet) => (
                    <div key={snippet.id} className="rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold">{snippet.title}</p>
                      <p className="text-sm text-muted-foreground">{snippet.language}</p>
                      <p className="mt-2 text-sm leading-6">{snippet.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Project notes and observations.</CardDescription>
              </div>
              <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Note</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      noteForm.handleSubmit()
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                      <noteForm.Field name="title">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Note title"
                            />
                          </Field>
                        )}
                      </noteForm.Field>

                      <noteForm.Field name="content">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Content</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Write the note here"
                            />
                          </Field>
                        )}
                      </noteForm.Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save Note</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes have been added yet.</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold">{note.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Links</CardTitle>
                <CardDescription>Reference URLs for the project.</CardDescription>
              </div>
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Link</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      linkForm.handleSubmit()
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Add Link</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                      <linkForm.Field name="title">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Link title"
                            />
                          </Field>
                        )}
                      </linkForm.Field>

                      <linkForm.Field name="url">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>URL</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="https://example.com"
                            />
                          </Field>
                        )}
                      </linkForm.Field>

                      <linkForm.Field name="description">
                        {(field) => (
                          <Field>
                            <Label htmlFor={field.name}>Description</Label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value ?? ''}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Why this link matters"
                            />
                          </Field>
                        )}
                      </linkForm.Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save Link</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <p className="text-sm text-muted-foreground">No links have been added yet.</p>
              ) : (
                <div className="space-y-4">
                  {links.map((link) => (
                    <div key={link.id} className="rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold">{link.title}</p>
                      <p className="text-sm text-muted-foreground">{link.url}</p>
                      <p className="mt-2 text-sm leading-6">{link.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
