import React, { useMemo, useRef, useState } from "react";
import axios from "axios";

import { Container, Grid, Button, Box } from "@material-ui/core";
import { DropzoneArea } from "material-ui-dropzone";
import LinearProgressWithLabel from "./LinearProgressWithLabel.js";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import "./App.css";

function App() {
	const [file, setFile] = useState(""); // storing the uploaded file
	// storing the recived file from backend
	const [data, getFile] = useState(null);
	const [progress, setProgess] = useState(0); // progess bar
	const [highlights, setHighlights] = useState([]);
	// const el = useRef(); // accesing input element

	const handleChange = (files) => {
		setProgess(0);
		const file = files[0]; // accesing file
		console.log(file);
		setFile(file); // storing file
	};
	const uploadFile = () => {
		if (!file) {
			alert("Please choose a PDF file before upload");
			return;
		}
		const formData = new FormData();
		formData.append("file", file); // appending file
		axios
			.post("https://htn21backend.glitch.me/upload-pdf", formData, {
				onUploadProgress: (ProgressEvent) => {
					let progress = Math.round(
						(ProgressEvent.loaded / ProgressEvent.total) * 100
					);
					setProgess(progress);
				},
			})
			.then((res) => {
				console.log(res);
				getFile({
					name: res.data.name,
					suggestions: res.data.suggestions,
				});
				let arrWords = res.data.suggestions.map(
					(obj) => Object.keys(obj)[0]
				);
				setHighlights(arrWords);
			})
			.catch((err) => console.log(err));
	};

	function highlightPattern(text, pattern) {
		const regex = new RegExp(pattern.join("|"), "gi");
		const splitText = text.split(regex);

		if (splitText.length <= 1) {
			return text;
		}

		const matches = text.match(regex);

		return splitText.reduce(
			(arr, element, index) =>
				matches[index]
					? [
							...arr,
							element,
							<mark key={index}>{matches[index]}</mark>,
					  ]
					: [...arr, element],
			[]
		);
	}

	const textRenderer = (textItem) => {
		if (textItem && textItem.str != "") {
			return highlightPattern(textItem.str, highlights);
		}
	};

	return (
		<Container maxWidth="lg">
			{/* Uploading section */}
			<Grid item xs={12} className="file-upload">
				<Box height="40px" />
				<DropzoneArea onChange={handleChange} />
				<Box height="20px" />
				<LinearProgressWithLabel
					className="progress-bar"
					value={progress}
				/>
				<Box height="20px" />
				<Button
					className="upload-button"
					variant="contained"
					color="primary"
					onClick={uploadFile}
					size="large"
				>
					Scan
				</Button>
				<Box height="20px" />
				<hr />
			</Grid>
			<Box height="20px" />
			{data && (
				<Grid container spacing={3}>
					{data.name && (
						<Document
							file={`https://htn21backend.glitch.me/${data.name}`}
						>
							<Page
								pageNumber={1}
								customTextRenderer={textRenderer}
								onLoadSuccess={() => {
									const textLayers = document.querySelectorAll(
										".react-pdf__Page__textContent"
									);
									textLayers.forEach((layer) => {
										const { style } = layer;
										style.top = "0";
										style.left = "0";
										style.transform = "";
									});
								}}
							/>
						</Document>
					)}

					{/* Recommendation section */}
					<Grid item md={4} xs={12}>
						<h2>Recommendations:</h2>
						<ul>
							{data.suggestions &&
								data.suggestions.map((s, i) => {
									const [map] = Object.entries(s);

									return (
										<li key={i}>
											<b>{map[0]}</b>: {map[1]}
										</li>
									);
								})}
						</ul>
					</Grid>
				</Grid>
			)}
		</Container>
	);
}
export default App;
