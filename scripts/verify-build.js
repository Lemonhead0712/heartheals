const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

// Configuration
const BUILD_DIR = path.join(process.cwd(), ".next")
const SIZE_THRESHOLD_KB = 500 // Alert if any JS file is larger than this

// ANSI color codes for console output
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// Helper function to format file sizes
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

// Helper function to calculate gzipped size
function getGzippedSize(content) {
  return zlib.gzipSync(content).length
}

// Function to analyze a directory recursively
function analyzeDirectory(dir, results = { files: [], totalSize: 0, totalGzippedSize: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      analyzeDirectory(fullPath, results)
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const content = fs.readFileSync(fullPath)
      const size = content.length
      const gzippedSize = getGzippedSize(content)

      results.files.push({
        path: fullPath.replace(BUILD_DIR, ""),
        size,
        gzippedSize,
        formattedSize: formatSize(size),
        formattedGzippedSize: formatSize(gzippedSize),
      })

      results.totalSize += size
      results.totalGzippedSize += gzippedSize
    }
  }

  return results
}

// Main function
function main() {
  console.log(`${COLORS.cyan}Analyzing build output in ${BUILD_DIR}...${COLORS.reset}\n`)

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`${COLORS.red}Build directory not found. Run 'next build' first.${COLORS.reset}`)
    process.exit(1)
  }

  // Analyze the build
  const results = analyzeDirectory(BUILD_DIR)

  // Sort files by size (largest first)
  results.files.sort((a, b) => b.size - a.size)

  // Print the largest files
  console.log(`${COLORS.magenta}Largest JavaScript files:${COLORS.reset}`)
  for (let i = 0; i < Math.min(10, results.files.length); i++) {
    const file = results.files[i]
    const color = file.size > SIZE_THRESHOLD_KB * 1024 ? COLORS.red : COLORS.green
    console.log(`${color}${file.path}${COLORS.reset}`)
    console.log(`  Size: ${file.formattedSize} (gzipped: ${file.formattedGzippedSize})`)
  }

  // Print summary
  console.log(`\n${COLORS.blue}Summary:${COLORS.reset}`)
  console.log(`Total JavaScript size: ${formatSize(results.totalSize)}`)
  console.log(`Total gzipped size: ${formatSize(results.totalGzippedSize)}`)
  console.log(`Number of JavaScript files: ${results.files.length}`)

  // Check for large files
  const largeFiles = results.files.filter((file) => file.size > SIZE_THRESHOLD_KB * 1024)
  if (largeFiles.length > 0) {
    console.log(
      `\n${COLORS.yellow}Warning: ${largeFiles.length} files exceed the size threshold of ${SIZE_THRESHOLD_KB} KB${COLORS.reset}`,
    )
  } else {
    console.log(`\n${COLORS.green}All files are under the size threshold of ${SIZE_THRESHOLD_KB} KB${COLORS.reset}`)
  }
}

main()
