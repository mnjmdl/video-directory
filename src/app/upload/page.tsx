import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { VideoUploadForm } from '@/components/video-upload-form'
import { prisma } from '@/lib/prisma'
import { Upload, FileVideo, AlertCircle } from 'lucide-react'

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/upload')
  }

  // Get categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
              <p className="text-sm text-gray-600">
                Share your content with the world
              </p>
            </div>
          </div>
        </div>

        {/* Upload Guidelines */}
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Upload Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Supported formats: MP4, WebM, MOV</li>
                <li>• Maximum file size: 500MB</li>
                <li>• Recommended resolution: 1920x1080 or higher</li>
                <li>• Make sure you have rights to upload this content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Loading upload form...</p>
              </div>
            </div>
          }>
            <VideoUploadForm 
              categories={categories}
              userId={session.user.id}
            />
          </Suspense>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tips for Better Uploads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Title & Description</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use clear, descriptive titles</li>
              <li>• Include relevant keywords</li>
              <li>• Write engaging descriptions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Thumbnails</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use high-quality images</li>
              <li>• Make thumbnails eye-catching</li>
              <li>• Ensure they represent your content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
