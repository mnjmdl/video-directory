'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileVideo, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isPublished: z.boolean(),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface VideoUploadFormProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    color?: string | null
  }>
  userId: string
}

export function VideoUploadForm({ categories, userId }: VideoUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      isPublished: false,
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid video file (MP4, WebM, MOV)')
        return
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024 // 500MB in bytes
      if (file.size > maxSize) {
        setUploadError('File size must be less than 500MB')
        return
      }

      setSelectedFile(file)
      setUploadError(null)
      
      // Auto-generate title from filename if not already set
      if (!watch('title')) {
        const fileName = file.name.split('.')[0]
        const formattedTitle = fileName
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
        setValue('title', formattedTitle)
      }
    }
  }

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid image file (JPEG, PNG, WebP)')
        return
      }

      // Validate file size (10MB limit for thumbnails)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        setUploadError('Thumbnail file size must be less than 10MB')
        return
      }

      setSelectedThumbnail(file)
      setUploadError(null)
    }
  }

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      setUploadError('Please select a video file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('video', selectedFile)
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail)
      }
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('categoryId', data.categoryId)
      formData.append('isPublished', String(data.isPublished))
      formData.append('userId', userId)

      // Simulate upload progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      const result = await response.json()
      
      // Redirect to the uploaded video
      setTimeout(() => {
        router.push(`/video/${result.id}`)
      }, 1000)

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video File *
        </label>
        <div
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/mov,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">{selectedFile.name}</p>
                <p className="text-sm text-green-700">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <FileVideo className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Click to upload video
                </p>
                <p className="text-sm text-gray-500">
                  MP4, WebM, MOV up to 500MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail (Optional)
        </label>
        <div
          onClick={() => thumbnailInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            selectedThumbnail
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
          
          {selectedThumbnail ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">{selectedThumbnail.name}</p>
                <p className="text-sm text-blue-700">
                  {formatFileSize(selectedThumbnail.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedThumbnail(null)
                  if (thumbnailInputRef.current) {
                    thumbnailInputRef.current.value = ''
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove thumbnail
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              <div>
                <p className="font-medium text-gray-900">Add thumbnail</p>
                <p className="text-sm text-gray-500">JPEG, PNG, WebP up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter video title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your video..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
            errors.categoryId ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isPublished"
          {...register('isPublished')}
          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
        <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
          Publish video immediately
        </label>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedFile || isUploading || !isValid}
          className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
        </button>
      </div>
    </form>
  )
}
