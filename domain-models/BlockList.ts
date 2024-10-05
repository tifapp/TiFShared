import { UserHandle, UserID } from "./User"

export type BlockListUser = {
  id: UserID
  name: string
  handle: UserHandle
  profileImageURL: string | null
}

export type BlockListPage = {
  users: BlockListUser[]
  nextPageToken: string | null
}

export const removeUsersFromBlockListPages = (
  pages: BlockListPage[],
  ids: UserID[]
): BlockListPage[] => {
  return pages.map((page) => ({
    ...page,
    users: page.users.filter((user) => !ids.includes(user.id))
  }))
}
