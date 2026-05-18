import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User"; // Make sure this matches your User model path
import { Users, Crown, User as UserIcon, Calendar, Mail, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  // 1. SECURITY: Kick out anyone who isn't an admin/tutor
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role === "student") {
    redirect("/"); 
  }

  // 2. FETCH DATA: Get all students from MongoDB
  await connectMongo();
  const students = await User.find({ role: "student" }).sort({ createdAt: -1 }).lean();

  // 3. CALCULATE STATS
  const totalStudents = students.length;
  const premiumStudents = students.filter((s: any) => s.isPremium).length;
  const freeStudents = totalStudents - premiumStudents;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" /> Student Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view all registered students on your platform.</p>
        </div>

        {/* STATS WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Premium Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{premiumStudents}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Free Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{freeStudents}</p>
            </div>
          </div>
        </div>

        {/* STUDENTS TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Signups</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No students found in the database.
                    </td>
                  </tr>
                ) : (
                  students.map((student: any) => (
                    <tr key={student._id.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                            {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {student.name || "Unknown User"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail className="h-4 w-4 opacity-50" />
                          {student.email}
                        </div>
                      </td>
                      <td className="p-4">
                        {student.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-md text-xs font-bold">
                            <Crown className="h-3 w-3" /> Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md text-xs font-bold">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-50" />
                        {student.createdAt 
                          ? new Date(student.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : "N/A"
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}