import axios from 'axios'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Using DiceBear API for free avatar generation
const AVATAR_API_BASE = 'https://api.dicebear.com/9.x'

export interface IconStyle {
  name: string
  value: string
  description: string
}

export const iconStyles: IconStyle[] = [
  { name: 'Fun Emoji', value: 'fun-emoji', description: 'Colorful and playful emoji avatars' },
  { name: 'Pixel Art', value: 'pixel-art', description: 'Retro pixel art style' },
  { name: 'Avataaars', value: 'avataaars', description: 'Cartoon-style human avatars' },
  { name: 'Bottts', value: 'bottts', description: 'Robot avatars' },
  { name: 'Identicon', value: 'identicon', description: 'Geometric pattern avatars' },
  { name: 'Shapes', value: 'shapes', description: 'Abstract shape combinations' }
]

export async function generateTeamIcon(
  teamName: string,
  style: string = 'fun-emoji',
  teamId: string
): Promise<string> {
  try {
    // Generate avatar URL with team name as seed for consistency
    const seed = encodeURIComponent(teamName + Date.now())
    const backgroundColor = generateColorFromString(teamName)
    const avatarUrl = `${AVATAR_API_BASE}/${style}/svg?seed=${seed}&backgroundColor=${backgroundColor}&size=256`
    
    // Fetch the SVG data
    const response = await axios.get(avatarUrl, {
      responseType: 'blob'
    })
    
    // Convert SVG to PNG using canvas
    const svgBlob = response.data
    const pngBlob = await convertSvgToPng(svgBlob)
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `team-icons/${teamId}-${Date.now()}.png`)
    const snapshot = await uploadBytes(storageRef, pngBlob)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    return downloadUrl
  } catch (error) {
    console.error('Error generating team icon:', error)
    throw new Error('Failed to generate team icon')
  }
}

async function convertSvgToPng(svgBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }
    
    img.onload = () => {
      canvas.width = 256
      canvas.height = 256
      ctx.drawImage(img, 0, 0, 256, 256)
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert to PNG'))
        }
      }, 'image/png')
    }
    
    img.onerror = () => reject(new Error('Failed to load SVG'))
    
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  })
}

function generateColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = hash % 360
  return `hsl(${hue}, 70%, 80%)`
}

// Alternative: Generate using UI Avatars (simpler but less customizable)
export async function generateSimpleTeamIcon(teamName: string, teamId: string): Promise<string> {
  try {
    const initials = teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    const backgroundColor = generateColorFromString(teamName).replace('#', '')
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=256&background=${backgroundColor}&color=fff&bold=true`
    
    // Fetch the image
    const response = await axios.get(avatarUrl, {
      responseType: 'blob'
    })
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `team-icons/${teamId}-${Date.now()}.png`)
    const snapshot = await uploadBytes(storageRef, response.data)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    return downloadUrl
  } catch (error) {
    console.error('Error generating simple team icon:', error)
    throw new Error('Failed to generate team icon')
  }
}