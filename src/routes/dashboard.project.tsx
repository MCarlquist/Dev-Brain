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
import { Folder, Plus } from 'lucide-react';
import { prisma } from '#/db';
import { createServerFn, useServerFn } from '@tanstack/react-start';
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

const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.project.findMany();
});

const createProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; description: string }) => data)
  .handler(async ({ data }) => {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
      },
    })
  })

export const Route = createFileRoute('/dashboard/project')({
  component: RouteComponent,
  loader: async () => getProjects()
})

function RouteComponent() {
  const createProjectFn = useServerFn(createProject);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      await createProjectFn({ data: value });
      form.reset();
    },
  })

  // fetches projects from database using the loader function defined above
  const projects = Route.useLoaderData();

  return (
    <div>
      <h1 className="text-5xl font-bold">Projects</h1>
      <p className="mt-4">Keep your code snippets, notes, and links organized by project.</p>
      {projects.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
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
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}>
              <Dialog>
              <DialogTrigger asChild>
                <Button size={'lg'} className='h-10 px-4 text-xl'><Plus /> Create Project</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
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
              </DialogContent>
            </Dialog>
            </form>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
