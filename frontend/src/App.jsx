import axios from 'axios';
import React, {useEffect, useState, useCallback, createRef} from 'react';
import {MdOutlineNoPhotography, MdAdd} from 'react-icons/md';
import {TiArrowShuffle} from 'react-icons/ti';
import CategorySelect from './components/CategorySelect';
import ImageAdder from './components/ImageAdder';
import ImageCard from './components/ImageCard';
import TagsEditor from './components/TagsEditor';

function App() {
	const [categories, setCategories] = useState();
	const [selected, setSelected] = useState();
	const [isLoading, setLoading] = useState(true);
	const [images, setImages] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [filter, setFilter] = useState([]);
	const galleryRef = createRef();
	useEffect(() => {
		async function fetchData() {
			let res = await axios.get(`${process.env.REACT_APP_API}/categories/get`);
			setCategories(res.data);
			const savedSelection = localStorage.getItem('selectedCategory');
			const selection = res.data.includes(savedSelection) ? savedSelection : res.data[0];
			setSelected(selection);

			res = await axios.get(`${process.env.REACT_APP_API}/images/get/${selection}`);
			const obj = {};
			obj[selection] = res.data;
			setImages(obj);
			setLoading(false);
		}
		fetchData();
	}, []);
	const select = async (name) => {
		if (!categories.includes(name)) {
			await axios.post(`${process.env.REACT_APP_API}/categories/add`, {name});
			setCategories([...categories, name]);
		}
		const res = await axios.get(`${process.env.REACT_APP_API}/images/get/${name}`);
		const obj = images;
		obj[name] = res.data.sort(() => Math.random() - 0.5);
		setImages(obj);
		setSelected(name);
		localStorage.setItem('selectedCategory', name);
	};
	const del = async (name) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/delete`, {name});
		setCategories(categories.filter(c => c !== name));
	};

	const addImportedImages = (added, category) => {
		const obj = {...images};
		obj[category] = [...(obj[category] || []), ...added];
		setImages(obj);
		setIsAdding(false);
	};

	const shuffleImages = useCallback(() => {
		const gallery = galleryRef.current;
		if (!gallery) return;
		gallery.style.opacity = 0;
		setTimeout(() => {
			const obj = {...images};
			obj[selected] = obj[selected].sort(() => Math.random() - 0.5);
			setImages(obj);
			gallery.style.opacity = 1;
		}, 250);
	}, [galleryRef, images, selected]);

	const handleUserKeyPress = useCallback(e => {
		if (e.key === 's')
			shuffleImages();
	}, [shuffleImages]);

	useEffect(() => {
		window.addEventListener('keydown', handleUserKeyPress);
		return () => {
			window.removeEventListener('keydown', handleUserKeyPress);
		};
	}, [handleUserKeyPress]);

	if (isLoading) {
		return (
			<div className='App bg-gray-800 w-full h-full flex items-center justify-center'>
				<div className='text-white font-title text-4xl'>Loading...</div>
			</div>
		);
	} else {
		const filtered = images[selected]?.filter(img => {
			for (const tag of filter) {
				if (!img.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) return false;
			}
			return true;
		});
		return (
			<div className='App bg-gray-800 w-full h-full flex flex-col'>
				{isAdding ? <ImageAdder categories={categories} close={() => setIsAdding(false)} addImportedImages={addImportedImages}></ImageAdder> : ''}
				<div className='w-full bg-gray-900 py-4 px-4 flex flex-row items-center justify-end md:justify-between shadow-sm'>
					<div className='font-title text-white text-4xl md:block hidden'>Foule</div>
					<div className='flex flex-row items-center'>
						<TagsEditor tags={filter} updateTags={setFilter}></TagsEditor>
						<TiArrowShuffle
							title='Shuffle images'
							color='#ffffff'
							size={45}
							className='mr-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2'
							onClick={shuffleImages}
						>
						</TiArrowShuffle>
						<CategorySelect categories={categories} selected={selected} select={select} delete={del}></CategorySelect>
					</div>
				</div>
				{filtered.length ?
					(<div
						className='images-grid flex sm:flex-wrap px-4 pt-2 transition-opacity duration-200 overflow-y-auto justify-center md:justify-between flex-col sm:flex-row items-center sm:items-start'
						style={{flexFlow: 'wrap'}}
						ref={galleryRef}
					>
						{filtered.map(image => (<ImageCard {...image} key={image.id}></ImageCard>))}
					</div>)
					:
					<div className='flex justify-center items-center h-full flex-col'>
						<div className='bg-black bg-opacity-50 rounded-full flex justify-center items-center w-32 h-32'>
							<MdOutlineNoPhotography size={48} color='#aaaaaa'></MdOutlineNoPhotography>
						</div>
						<div className='text-gray-400 font-title text-4xl my-4'>No images</div>
					</div>
				}
				<div
					className='fixed bottom-0 right-0 m-10 bg-gray-700 shadow-lg rounded-full cursor-pointer p-2 z-50'
					onClick={() => setIsAdding(true)}
				>
					<MdAdd color='#ffffff' size={38}></MdAdd>
				</div>
			</div>
		);
	}
}

export default App;