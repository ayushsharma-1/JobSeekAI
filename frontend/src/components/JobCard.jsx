import PropTypes from "prop-types"

function JobCard({ job }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getPlatformColor = (platform) => {
    const colors = {
      LinkedIn: "bg-blue-100 text-blue-800 border-blue-200",
      Wellfound: "bg-green-100 text-green-800 border-green-200",
      Naukri: "bg-purple-100 text-purple-800 border-purple-200",
      Indeed: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Glassdoor: "bg-teal-100 text-teal-800 border-teal-200",
      Monster: "bg-orange-100 text-orange-800 border-orange-200",
      SimplyHired: "bg-pink-100 text-pink-800 border-pink-200",
      ZipRecruiter: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[platform] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 p-6 group relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium mt-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {job.company}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(job.platform)}`}
            >
              {job.platform}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{job.description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(job.date_posted)}
          </div>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group/button"
          >
            Apply Now
            <svg
              className="w-4 h-4 ml-2 group-hover/button:translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

JobCard.propTypes = {
  job: PropTypes.shape({
    title: PropTypes.string,
    company: PropTypes.string,
    platform: PropTypes.string,
    date_posted: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
}

export default JobCard
