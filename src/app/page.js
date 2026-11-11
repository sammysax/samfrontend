// Mark this page as a client component so it can use React hooks and fetch data in the browser.
"use client"

// Import React and the hooks used for state management and side effects.
import React, {useState, useEffect} from 'react'

function Page() {
  // Hold the population records received from the API.
  const [population, setPopulation] = useState([])
  // Track whether the initial population request is still running.
  const [loading, setLoading] = useState(true)
  // Store a message to display when the request or response validation fails.
  const [error, setError] = useState('')

  // Load population data after mounting and cancel the request on unmount.
  useEffect(() => {
    // Create a cancellation signal for the fetch request.
    const controller = new AbortController()

    // Fetch the population data, validate its shape, and update component state.
    async function loadPopulation() {
      try {
        // Request the data and allow the effect cleanup to abort the request.
        const response = await fetch('http://localhost:5000/api/population', {
          signal: controller.signal,
        })

        // Treat non-success HTTP responses as request failures.
        if (!response.ok) {
          throw new Error(`Unable to load population data (HTTP ${response.status}).`)
        }

        // Parse JSON and support each response shape accepted by this page.
        const data = await response.json()
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.population)
            ? data.population
            : Array.isArray(data?.data)
              ? data.data
              : null

        // Ensure the API supplied records in one of the expected array locations.
        if (!records) {
          throw new Error('The population API returned data in an unexpected format.')
        }

        // Save the validated records for rendering.
        setPopulation(records)
      } catch (loadError) {
        // Ignore an intentional abort and save any other failure for display.
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Unable to load population data.')
        }
      } finally {
        // Stop showing the loading state unless this request was cancelled.
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    // Begin the asynchronous data load.
    loadPopulation()
    // Abort the request if the component is removed before it finishes.
    return () => controller.abort()
  }, [])

  // Render the page title and a table that reflects the current request state.
  return (
    <main className='min-h-screen bg-slate-100 px-4 py-10 text-slate-900'>
      <div className='mx-auto w-full max-w-6xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200'>
        <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            {/* Name the population data section. */}
            <p className='text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600'>Population Censor</p>
          </div>
          {/* This optional badge can show the number of records when enabled. */}
          {/* <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200'>Total items: {population.length}</div> */}
        </div>

        {/* Keep the table usable on small screens by allowing horizontal scrolling. */}
        <div className='overflow-x-auto rounded-3xl border border-slate-200'>
          <table className='min-w-full divide-y divide-slate-200'>
            {/* Identify the data shown in each table column. */}
            <thead className='bg-slate-900 text-white'>
              <tr>
                <th className='whitespace-nowrap px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Name</th>
                <th className='whitespace-nowrap px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Age</th>
                <th className='whitespace-nowrap px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Country</th>
                <th className='whitespace-nowrap px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Gender</th>
              </tr>
            </thead>
            {/* Show loading, error, empty, or populated rows as appropriate. */}
            <tbody className='divide-y divide-slate-200 bg-white'>
              {/* Check request status first so feedback takes precedence over table data. */}
              {loading ? (
                <tr>
                  <td colSpan='4' className='px-6 py-12 text-center text-sm text-slate-500'>Loading population data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan='4' role='alert' className='px-6 py-12 text-center text-sm text-red-600'>{error}</td>
                </tr>
              ) : population.length === 0 ? (
                <tr>
                  <td colSpan='4' className='px-6 py-12 text-center text-sm text-slate-500'>No population data available.</td>
                </tr>
              ) : (
                /* Render one row for each population record, using a stable key where possible. */
                population.map((item, index) => (
                  <tr key={item.id ?? index} className='hover:bg-slate-50'>
                    {/* Display the four values associated with each population record. */}
                    <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900'>{item.name}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>{item.age}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>{item.country}</td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-slate-700'>{item.gender}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

// Make the page available to the Next.js app router.
export default Page