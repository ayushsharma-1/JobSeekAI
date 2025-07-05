function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 mt-4">Loading jobs...</p>
    </div>
  )
}

export default LoadingSpinner
