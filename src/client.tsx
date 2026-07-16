import { createStartHandler } from '@tanstack/react-start/client'
import { createRouter } from './src/router'

const router = createRouter()
const handler = createStartHandler({ router })

handler()
