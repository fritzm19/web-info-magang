import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch the user's application
  const application = await prisma.application.findUnique({
    where: {
      // @ts-expect-error: session.user.id is string
      userId: parseInt(session.user.id),
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account and application details.</p>
          </div>
          <Link 
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
          {/* Section 1: Account Info */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Details</h2>
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {session.user?.name?.charAt(0) || "U"}
              </div>
              <div className="ml-4">
                <div className="text-lg font-bold text-gray-900">{session.user?.name}</div>
                <div className="text-gray-500">{session.user?.email}</div>
                <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded inline-block mt-1">
                  {/* @ts-expect-error: role check */}
                  {session.user?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Internship Application */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold text-gray-900">Internship Application</h2>
                 {application && (
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        application.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        application.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                     }`}>
                        {application.status}
                     </span>
                 )}
            </div>

            {!application ? (
              // State A: User hasn't applied yet
              <div className="text-center py-8">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-3 text-2xl">📝</div>
                <h3 className="text-gray-900 font-medium">No Application Found</h3>
                <p className="text-gray-500 text-sm mb-4">You haven&apos;t submitted your internship data yet.</p>
                <Link 
                  href="/dashboard/apply" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                >
                  Start Application
                </Link>
              </div>
            ) : (
              // State B: User HAS applied
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Full Name</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{application.fullName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">University / School</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{application.campus}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Major</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{application.major}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase">Current Semester</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{application.semester}</dd>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Curriculum Vitae</dt>
                  <dd className="mt-1 text-sm">
                    {application.cvUrl ? (
                      <a 
                        href={application.cvUrl} 
                        target="_blank" 
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        📄 Download Uploaded CV
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No CV uploaded (Optional)</span>
                    )}
                  </dd>
                </div>
              </dl>
            )}

            {/* Edit Button (Visible if applied) */}
            {application && application.status === 'PENDING' && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link 
                        href="/dashboard/apply" 
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                    >
                        Update Information
                    </Link>
                    <span className="text-xs text-gray-400 ml-2">(Re-submitting will update your data)</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}