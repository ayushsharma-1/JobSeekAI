"use client"

import { useState, useEffect } from "react"
import JobCard from "./components/JobCard"
import Filters from "./components/Filters"
import "./index.css"

function App() {
  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState({ title: "", platform: "" })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
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

  const totalPages = Math.ceil(totalJobs / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">JobSeekerAI Dashboard</h1>
            <p className="text-lg text-gray-600 mb-4">
              Discover your next career opportunity with AI-powered job search
            </p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-blue-200 animate-pulse"></div>
            </div>
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
                    We couldn't find any jobs matching your criteria. Try adjusting your search filters to discover more
                    opportunities.
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
              © 2024 JobSeekerAI. Powered by artificial intelligence to help you find your dream job.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
