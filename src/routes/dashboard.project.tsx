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
import { Code, Folder, Infinity, Link, Plus } from 'lucide-react';
import { prisma } from '#/db';
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
import { useState } from 'react';
import {
  formatDistance
} from "date-fns";
import { enUS } from "date-fns/locale";

const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.project.findMany({
    include: {
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          snippets: true,
          notes: true,
          links: true,
        },
      },
    },
  });
});

const createProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; description: string }) => data)
  .handler(async ({ data }) => {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    console.log('Created project:', project);
    return project;
  })

export const Route = createFileRoute('/dashboard/project')({
  component: RouteComponent,
  loader: async () => getProjects()
})

function RouteComponent() {
  const createProjectFn = useServerFn(createProject);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      await createProjectFn({ data: value });
      form.reset();
      setDialogOpen(false);
    },
  })

  // fetches projects from database using the loader function defined above
  const projects = Route.useLoaderData();

  return (
    <div>
      <h1 className="text-5xl font-bold">Projects</h1>
      <p className="mt-4 w-150 text-balance">Manage your technical knowledge ecosystem. Centralized snippets,
        architectural notes, and critical resources organized by project.</p>
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
                  <span>{formatDistance(project.createdAt, new Date(), { locale: enUS })} ago</span>
                </div>
                <div className="flex items-center gap-4">
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
              </CardFooter>
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
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size={'lg'} className='h-10 px-4 text-xl'><Plus /> Create Project</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                >
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <FieldGroup>
                    <form.Field name="name">
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
                    </form.Field>

                    <form.Field name="description">
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
                    </form.Field>
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
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
