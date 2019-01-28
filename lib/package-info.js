'use strict'

// retrieves package info given the name of a file in the package

module.exports = {
  forFileName
}

const fs = require('fs')
const path = require('path')

// return {dir, name} for a package given a file in the package
function forFileName (fileName) {
  const dirName = path.dirname(fileName)
  if (DirPackageMap.has(dirName)) return DirPackageMap.get(dirName)

  const packageInfo = getPackageInfo(fileName)
  DirPackageMap.set(dirName, packageInfo)

  return packageInfo
}

// map of file's dirname -> { dir: package root dir, package: package name}
const DirPackageMap = new Map()

// get the package info for a file name
function getPackageInfo (fileName) {
  const root = path.parse(fileName).root

  // loop through parent dirs of file, looking for a package.json
  let dirName = path.dirname(fileName)
  while (dirName !== root) {
    if (DirPackageMap.has(dirName)) return DirPackageMap.get(dirName)

    if (hasPackageJson(dirName)) {
      return {
        dir: dirName,
        name: getPackageName(dirName)
      }
    }

    // get parent dir, adding some bullet-proofing
    dirName = path.dirname(dirName)
    if (dirName == null) dirName = root
    if (dirName === '') dirName = root
    if (dirName === '/') dirName = root
  }

  // wops, couldn't find it
  return {
    dir: root,
    name: 'unknown-package'
  }
}

// return whether a package.json file exists in the directory
function hasPackageJson (dirName) {
  const fileName = path.join(dirName, 'package.json')
  return fs.existsSync(fileName)
}

// return the name of a package from it's package.json
function getPackageName (dirName) {
  const fileName = path.join(dirName, 'package.json')

  try {
    var packageJSON = require(fileName)
  } catch (err) {
    return 'unreadable-package'
  }

  return packageJSON.name || 'anonymous-package'
}
