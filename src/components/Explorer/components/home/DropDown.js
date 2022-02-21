import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Up from '../../assets/svg/up.svg'
import Down from '../../assets/svg/down.svg'
import styled from '@emotion/styled';
import { Box } from '@mui/material';

const ArrowComponent=styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    marginRight: '3px'
})

const ArrowIcon = () => (
    <ArrowComponent>
        <Box component={'img'} src={Up} alt='' />
        <Box component={'img'} src={Down} alt='' />
    </ArrowComponent>
)

export default function DropDown({ value, options, setValue, title }) {

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <FormControl variant='outlined' sx={{height:'40px', minWidth: 130, background: 'rgba(101, 54, 187, .55)', borderRadius: '8px', margin:'10px 0 0 10px' }}>
            <InputLabel style={{
                fontFamily:'TTNorms-Regular',
                color:'#fff',
                fontSize:'13px'
            }}>{title}</InputLabel>
            <Select
                style={{
                    color: '#fff',
                    padding: '0px',
                    height:'40px'
                }}
                value={value}
                label={title}
                autoWidth
                onChange={handleChange}
                IconComponent={ArrowIcon}
            >
                {
                    options.map((item, index) => (
                        <MenuItem id='item' value={item} key={index}>{item}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    );
}