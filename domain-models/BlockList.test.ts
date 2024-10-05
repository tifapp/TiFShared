import { removeUsersFromBlockListPages } from "./BlockList"
import { UserHandle } from "./User"
import { randomUUID } from "crypto"

describe("BlockList tests", () => {
  describe("RemoveFromBlockList tests", () => {
    it("should be able to remove users from the block list across multiple pages", () => {
      const pages = [
        {
          users: [
            {
              id: randomUUID(),
              name: "bob",
              handle: UserHandle.zed,
              profileImageURL: null
            },
            {
              id: randomUUID(),
              name: "joe",
              handle: UserHandle.sillyBitchell,
              profileImageURL: null
            }
          ],
          nextPageToken: randomUUID()
        },
        {
          users: [
            {
              id: randomUUID(),
              name: "billy",
              handle: UserHandle.alvis,
              profileImageURL: null
            },
            {
              id: randomUUID(),
              name: "anna",
              handle: UserHandle.bitchellDickle,
              profileImageURL: null
            }
          ],
          nextPageToken: null
        }
      ]
      const newPages = removeUsersFromBlockListPages(pages, [
        pages[0].users[1].id,
        pages[1].users[0].id
      ])
      expect(newPages).toEqual([
        {
          ...pages[0],
          users: [pages[0].users[0]]
        },
        {
          ...pages[1],
          users: [pages[1].users[1]]
        }
      ])
    })
  })
})
