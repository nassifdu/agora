export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export type Tag = {
  id: string
  name: string
}

export type Post = {
  id: string
  user_id: string
  main_thought: string
  image_url: string | null
  details: string | null
  is_image: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  tags?: Tag[]
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

export type Like = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}
