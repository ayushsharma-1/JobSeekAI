import { useState, useEffect } from "react"
import JobCard from "../components/JobCard"
import Filters from "../components/Filters"
import LoadingSpinner from "../components/LoadingSpinner"
import "../index.css"

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState({ title: "", platform: "" })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const [error, setError] = useState(null)
  const limit = 10

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams({
          page,
          limit,
          ...(filters.title && { title: filters.title }),
          ...(filters.platform && { platform: filters.platform }),
        }).toString()

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
        const fullUrl = `${apiUrl}/jobs?${query}`
        console.log("Fetching jobs from:", fullUrl)
        const res = await fetch(fullUrl, {
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include credentials for CORS if needed
        })

        console.log("Response status:", res.status, res.statusText)
        console.log("Response headers:", [...res.headers.entries()])
        
        // Check content type
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text()
          console.error("Non-JSON response received:", text.slice(0, 100))
          throw new Error(`Expected JSON, got ${contentType || "no content-type"}`)
        }

        if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`)
        
        const data = await res.json()
        console.log("API Response:", data)
        
        if (!data.jobs) throw new Error("No jobs data in response")
        setJobs(data.jobs.map(job => ({ ...job, id: job.url })) || [])
        setTotalJobs(data.total || 0)
      } catch (error) {
        console.error("Error fetching jobs:", error.message)
        setError(error.message)
        setJobs([])
        setTotalJobs(0)
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
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const fullUrl = `${apiUrl}/scrape`
      console.log("Triggering scrape at:", fullUrl)
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      console.log("Scrape response status:", res.status, res.statusText)
      console.log("Scrape response headers:", [...res.headers.entries()])

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON scrape response:", text.slice(0, 100))
        throw new Error(`Expected JSON, got ${contentType || "no content-type"}`)
      }

      if (!res.ok) throw new Error(`Failed to trigger scrape: ${res.status} ${res.statusText}`)
      const data = await res.json()
      console.log("Scrape response:", data.message)
      
      // Fetch updated jobs
      const query = new URLSearchParams({ page: 1, limit }).toString()
      const jobRes = await fetch(`${apiUrl}/jobs?${query}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      console.log("Post-scrape response status:", jobRes.status, jobRes.statusText)
      if (!jobRes.ok) throw new Error(`Failed to fetch jobs after scrape: ${jobRes.status} ${jobRes.statusText}`)
      const jobData = await jobRes.json()
      console.log("Post-scrape jobs:", jobData)
      setJobs(jobData.jobs.map(job => ({ ...job, id: job.url })) || [])
      setTotalJobs(jobData.total || 0)
      setPage(1)
    } catch (error) {
      console.error("Error triggering scrape:", error.message)
      setError(error.message)
    } finally {
      setScrapeLoading(false)
    }
  }

  const totalPages = Math.ceil(totalJobs / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg mr-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">JobSeekerAI</h1>
                  <p className="text-gray-600 mt-1">Discover your next career opportunity with AI-powered job search</p>
                </div>
              </div>
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
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    Fetch Now
                  </>
                )}
              </button>
              {totalJobs > 0 && (
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  {totalJobs} jobs available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-2">Please check your backend connection or try again.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner />
            <p className="text-gray-600 mt-6 text-lg">Finding the perfect jobs for you...</p>
            <div className="flex space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <>
            {jobs.length > 0 ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {filters.title || filters.platform ? "Filtered Results" : "Latest Opportunities"}
                    </h2>
                    <div className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {jobs.map((job) => (
                    <JobCard key={job.url} job={job} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No jobs found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any jobs matching your criteria. Try adjusting your search filters or fetch new jobs.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      Try different keywords
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      Expand platform selection
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {jobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(page * limit, totalJobs)}</span> of{" "}
                      <span className="font-medium">{totalJobs}</span> results
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm"
                      disabled={page === 1 || loading}
                      onClick={() => setPage(page - 1)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="hidden sm:flex items-center space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        const isActive = pageNum === page
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setPage(totalPages)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                              totalPages === page
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 JobSeekerAI. Powered by artificial intelligence to help you find your dream job.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard