'use client'

import { Avatar as AvatarPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

type AvatarSize = 'default' | 'sm' | 'lg'

const AVATAR_SIZE_CLASS_NAME: Record<AvatarSize, string> = {
  default: 'size-8',
  sm: 'size-6',
  lg: 'size-10',
}

const AVATAR_FALLBACK_CLASS_NAME: Record<AvatarSize, string> = {
  default: 'text-sm',
  sm: 'text-xs',
  lg: 'text-sm',
}

const AVATAR_BADGE_CLASS_NAME: Record<AvatarSize, string> = {
  default: 'size-2.5',
  sm: 'size-2',
  lg: 'size-3',
}

function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full select-none',
        AVATAR_SIZE_CLASS_NAME[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  size?: AvatarSize
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground',
        AVATAR_FALLBACK_CLASS_NAME[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'span'> & {
  size?: AvatarSize
}) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full',
        'bg-primary text-primary-foreground ring-2 ring-background select-none',
        AVATAR_BADGE_CLASS_NAME[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'flex -space-x-2',
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  size?: AvatarSize
}) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-muted text-sm',
        'text-muted-foreground ring-2 ring-background',
        AVATAR_SIZE_CLASS_NAME[size],
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
}
