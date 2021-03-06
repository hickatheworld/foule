import { createRef, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { MdDownload, MdEdit, MdOpenInNew } from 'react-icons/md';

export default function ImageCard(props: ImageCardProps) {
	const mediaRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isLoaded, setLoaded] = useState(false);
	const [isDownloading, setDownloading] = useState(false);
	useEffect(() => {
		if (!containerRef.current)
			return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && !isLoaded)
				setLoaded(true);
		}, {
			root: null,
			threshold: 0.01
		});
		observer.observe(containerRef.current);
	}, [containerRef, isLoaded, props.id]);

	const download = () => {
		setDownloading(true);
		fetch(`${process.env.REACT_APP_API}/download/${props.id}`)
			.then(response => response.blob())
			.then(blob => {
				const blobURL = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = blobURL;
				a.style.display = 'none';
				a.download = props.id;
				document.body.appendChild(a);
				a.click();
				a.remove();
				setDownloading(false);
			}).catch(() => null);
	};


	return (
		<div
			id={props.id}
			className='image-card cursor-pointer relative m-1 flex items-center justify-center rounded-md bg-gray-700 overflow-hidden [width:300px] [height:300px]'
			title={props.tags.join(', ')}
			onClick={props.onClick}
			ref={containerRef}
		>
			{isDownloading && <div className='loader absolute w-4 h-4 z-20'></div>}
			{
				isLoaded ?
					<img
						src={`${process.env.REACT_APP_API}/posters/${props.id}?authorization=${process.env.REACT_APP_API_KEY}`}
						alt={props.tags.join(', ')}
						className='block w-full h-full object-cover z-10'
						width={300}
						height={300}
						ref={mediaRef}
					/>
					: null

			}
			<div className='image-card-actions absolute z-20 top-0 right-0 flex flex-row m-1 opacity-0 transition-opacity duration-100'>
				<MdEdit color='#fff' size={24} onClick={e => { e.stopPropagation(); props.edit(); }} title={'Edit'} className='transform hover:translate-y-1 transition-all duration-100'></MdEdit>
				<a href={props.url} target='_blank' rel='noreferrer' onClick={e => e.stopPropagation()}>
					<MdOpenInNew color='#fff' size={24} title='Download' className='transform hover:translate-y-1 transition-all duration-100'></MdOpenInNew>
				</a>
				<MdDownload color='#fff' size={24} title='Download' className='transform hover:translate-y-1 transition-all duration-100' onClick={e => { e.stopPropagation(); download(); }}></MdDownload>
			</div>
			<div className='image-card-tags opacity-0 absolute bottom-0 left-0 w-full box-border px-1 bg-black bg-opacity-50 text-white truncate z-20'>
				{props.tags.join(', ')}
			</div>
		</div >
	);
}

export interface ImageCardProps {
	id: string;
	tags: string[];
	onClick: MouseEventHandler;
	edit: () => void;
	url: string;
}