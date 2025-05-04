"use client"

import { useState } from "react"
import {
  dependencyAnalysis,
  getOptimizationOpportunities,
  getLargeDependencies,
  getCodeSplittingOpportunities,
} from "@/utils/dependency-audit"

export default function DependencyAuditPage() {
  const [activeTab, setActiveTab] = useState<"all" | "large" | "optimization" | "splitting">("all")

  const largeDependencies = getLargeDependencies()
  const optimizationOpportunities = getOptimizationOpportunities()
  const codeSplittingOpportunities = getCodeSplittingOpportunities()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Dependency Audit</h1>

      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded ${activeTab === "all" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
          >
            All Dependencies
          </button>
          <button
            onClick={() => setActiveTab("large")}
            className={`px-4 py-2 rounded ${activeTab === "large" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
          >
            Large Dependencies
          </button>
          <button
            onClick={() => setActiveTab("optimization")}
            className={`px-4 py-2 rounded ${activeTab === "optimization" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
          >
            Optimization Opportunities
          </button>
          <button
            onClick={() => setActiveTab("splitting")}
            className={`px-4 py-2 rounded ${activeTab === "splitting" ? "bg-pink-500 text-white" : "bg-gray-200"}`}
          >
            Code Splitting
          </button>
        </div>

        {activeTab === "all" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size (KB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gzip Size (KB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treeshakeable
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(dependencyAnalysis).map((dep) => (
                  <tr key={dep.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dep.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dep.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dep.gzipSize}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dep.treeshakeable ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "large" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size (KB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gzip Size (KB)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {largeDependencies.map((dep) => (
                  <tr key={dep.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dep.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dep.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dep.gzipSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "optimization" && (
          <div className="space-y-4">
            {optimizationOpportunities.map((opp, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg">{opp.dependency}</h3>
                <p className="text-gray-700">{opp.suggestion}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "splitting" && (
          <div className="space-y-4">
            {codeSplittingOpportunities.map((opp, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-lg">{opp.dependency}</h3>
                <p className="text-gray-700">{opp.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This is a development tool only. The data shown is for demonstration purposes. In a production
              environment, you would use tools like webpack-bundle-analyzer to generate accurate dependency information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
