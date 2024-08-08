import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Clears the preview mode cookies.
    // This function accepts no arguments.
    res.clearPreviewData();

    res.redirect("/");
  } catch (error) {
    return res.status(500).json({ message: error });
  }
}
