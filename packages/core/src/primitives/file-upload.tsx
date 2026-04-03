// Layer 1: FileUpload primitive
// Generic file upload component with drag-and-drop zone styling.
// Knows nothing about schemas — accepts standard controlled props.

import { useState, useRef } from 'react'
import type { HTMLAttributes } from 'react'

type RestProps = Omit<HTMLAttributes<HTMLDivElement>, 'value' | 'onChange' | 'disabled' | 'accept' | 'multiple'>

interface FileUploadProps extends RestProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  value?: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function FileUpload({
  accept,
  maxSize,
  multiple = false,
  value = [],
  onChange,
  disabled = false,
  ...rest
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (fileList: File[]): File[] => {
    const validFiles: File[] = []
    for (const file of fileList) {
      if (maxSize && file.size > maxSize) {
        setError(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`)
        continue
      }
      validFiles.push(file)
    }
    return validFiles
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    setError(null)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(droppedFiles)

    if (validFiles.length > 0) {
      onChange(multiple ? [...value, ...validFiles] : [validFiles[0]])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFiles = Array.from(e.target.files ?? [])
    const validFiles = validateFiles(selectedFiles)

    if (validFiles.length > 0) {
      onChange(multiple ? [...value, ...validFiles] : [validFiles[0]])
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const dropZoneClassName = `border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
    isDragging
      ? 'border-primary bg-primary/5'
      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}${rest.className ? ` ${rest.className}` : ''}`

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={dropZoneClassName}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        <div className="text-sm text-muted-foreground">
          {isDragging ? (
            'Drop files here...'
          ) : (
            <>
              Click or drag files here to upload
              {accept && (
                <span className="block text-xs mt-1">
                  Accepted: {accept}
                </span>
              )}
              {maxSize && (
                <span className="block text-xs mt-0.5">
                  Max size: {formatFileSize(maxSize)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-muted-foreground ml-2 text-xs">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className="ml-2 text-destructive hover:text-destructive/80 text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}