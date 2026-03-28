import { Link } from "@tanstack/react-router";
import { Code, Folder, Notebook, Wrench } from "lucide-react";


export default function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-(--line) bg-(--sidebar-bg) px-4 py-6 lg:block">
            <h1 className="text-4xl font-black tracking-tighter">Dev Brain</h1>
            <span className="text-green-500 font-mono tracking-tight">Your Knowledge Base</span>
            <nav className="flex flex-col gap-7 mt-10">
                <Link to="/dashboard/project">
                    <p className="text-2xl flex items-center gap-2">
                       <Folder /> Projects
                    </p>
                </Link>
                <Link to="/dashboard/snippets">
                    <p className="text-2xl flex items-center gap-2">
                       <Code /> Snippets
                    </p>
                </Link>
                <Link to="/dashboard/notes">
                    <p className="text-2xl flex items-center gap-2">
                       <Notebook /> Notes
                    </p>
                </Link>
                
                <Link
                    to="/dashboard/settings"
                    className="rounded-lg my-2 text-sm font-semibold"
                >

                    <p className="flex items-center gap-2"> <Wrench /> Settings</p>
                </Link>
            </nav>
        </aside>
    )
}