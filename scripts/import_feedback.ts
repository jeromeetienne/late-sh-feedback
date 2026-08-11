import Fs from 'node:fs/promises';
import Path from 'node:path';

const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//	ImportFeedback — downloads the feedback text files from the late-sh repository
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Downloads bugs.txt and suggestions.txt from the "feedback" folder of the mpiorowski/late-sh
 * GitHub repository and writes them into the local "data/feedback" folder.
 */
export class ImportFeedback {
	/** GitHub repository owner that holds the source feedback files. */
	static readonly REPOSITORY_OWNER = 'mpiorowski';

	/** GitHub repository name that holds the source feedback files. */
	static readonly REPOSITORY_NAME = 'late-sh';

	/** Git branch to read the source feedback files from. */
	static readonly REPOSITORY_BRANCH = 'main';

	/** File names to download from the repository "feedback" folder. */
	static readonly FEEDBACK_FILE_NAMES = ['bugs.txt', 'suggestions.txt'];

	/**
	 * Downloads every entry in {@link ImportFeedback.FEEDBACK_FILE_NAMES} and writes it into
	 * the local "data/feedback" folder.
	 *
	 * @returns A promise that resolves once every feedback file has been written to disk.
	 */
	static async run(): Promise<void> {
		const outputFolderPath = Path.join(__dirname, '..', 'data', 'feedback');
		await Fs.mkdir(outputFolderPath, { recursive: true });

		for (const feedbackFileName of ImportFeedback.FEEDBACK_FILE_NAMES) {
			const fileContent = await ImportFeedback._downloadFeedbackFile(feedbackFileName);
			const outputFilePath = Path.join(outputFolderPath, feedbackFileName);
			await Fs.writeFile(outputFilePath, fileContent, 'utf8');
			console.log(`Wrote ${outputFilePath}`);
		}
	}

	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////
	//	Private Helpers
	///////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////

	/**
	 * Downloads one feedback file from the "feedback" folder of the source GitHub repository.
	 *
	 * @param feedbackFileName - Name of the file to download, relative to the repository "feedback" folder.
	 * @returns A promise that resolves with the raw text content of the downloaded file.
	 */
	static async _downloadFeedbackFile(feedbackFileName: string): Promise<string> {
		const sourceUrl =
			`https://raw.githubusercontent.com/${ImportFeedback.REPOSITORY_OWNER}/` +
			`${ImportFeedback.REPOSITORY_NAME}/${ImportFeedback.REPOSITORY_BRANCH}/feedback/${feedbackFileName}`;

		const response = await fetch(sourceUrl);
		if (response.ok === false) {
			throw new Error(`Failed to download ${sourceUrl} - HTTP status ${response.status}`);
		}

		const fileContent = await response.text();
		return fileContent;
	}
}

await ImportFeedback.run();
