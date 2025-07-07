import { useState, useEffect } from "react"
import JobCard from "../components/JobCard"
import Filters from "../components/Filters"
import LoadingSpinner from "../components/LoadingSpinner"

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState({ title: "", platform: "" })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const limit = 10

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams({
          page,
          limit,
          ...(filters.title && { title: filters.title }),
          ...(filters.platform && { platform: filters.platform }),
        }).toString()

        const res = await fetch(`${import.meta.env.VITE_API_URL}/jobs?${query}`)
        const data = await res.json()
        setJobs(data.jobs || [])
        setTotalJobs(data.total || 0)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [page, filters])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleFetchNow = async () => {
    setScrapeLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/scrape`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        console.log(data.message)
        // Refresh jobs after scraping
        const query = new URLSearchParams({ page: 1, limit }).toString()
        const jobRes = await fetch(`${import.meta.env.VITE_API_URL}/jobs?${query}`)
        const jobData = await jobRes.json()
        setJobs(jobData.jobs || [])
        setTotalJobs(jobData.total || 0)
        setPage(1)
      } else {
        console.error("Failed to trigger scrape")
      }
    } catch (error) {
      console.error("Error triggering scrape:", error)
    } finally {
      setScrapeLoading(false)
    }
  }

  const totalPages = Math.ceil(totalJobs / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">JobSeekerAI</h1>
              <p className="text-gray-600 mt-1">Find your dream job with AI-powered search</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleFetchNow}
                disabled={scrapeLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scrapeLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Fetch Now
                  </>
                )}
              </button>
              <div className="bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-blue-700 text-sm font-medium">{totalJobs} jobs found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {jobs.map((job) => (
                  <JobCard key={job.url} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search filters or fetch new jobs to find more opportunities.</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(page - 1)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                </div>

                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard