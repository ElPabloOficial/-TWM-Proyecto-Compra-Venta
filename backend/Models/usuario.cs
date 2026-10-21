using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class usuario
{
    public string rut { get; set; } = null!;

    public string nombre { get; set; } = null!;

    public string clave { get; set; } = null!;

    public DateOnly fechanacimiento { get; set; }

    public DateOnly fechacreacion { get; set; }

    public string tipousuario { get; set; } = null!;

    public string? descuentos { get; set; }

    public bool secioniniciada { get; set; }

    public virtual ICollection<correo> correos { get; set; } = new List<correo>();

    public virtual ICollection<crear1> crear1s { get; set; } = new List<crear1>();

    public virtual ICollection<crear2> crear2s { get; set; } = new List<crear2>();

    public virtual ICollection<crear3> crear3s { get; set; } = new List<crear3>();

    public virtual ICollection<crear4> crear4s { get; set; } = new List<crear4>();

    public virtual ICollection<enviar> enviars { get; set; } = new List<enviar>();

    public virtual ICollection<escribir1> escribir1s { get; set; } = new List<escribir1>();

    public virtual ICollection<escribir2> escribir2s { get; set; } = new List<escribir2>();

    public virtual ICollection<generar1> generar1s { get; set; } = new List<generar1>();

    public virtual ICollection<generar2> generar2s { get; set; } = new List<generar2>();

    public virtual ICollection<hacer1> hacer1s { get; set; } = new List<hacer1>();

    public virtual ICollection<hacer2> hacer2s { get; set; } = new List<hacer2>();

    public virtual ICollection<inventario> inventarios { get; set; } = new List<inventario>();

    public virtual ICollection<ofrecer1> ofrecer1s { get; set; } = new List<ofrecer1>();

    public virtual ICollection<ofrecer2> ofrecer2s { get; set; } = new List<ofrecer2>();

    public virtual ICollection<solicitar1> solicitar1s { get; set; } = new List<solicitar1>();

    public virtual ICollection<solicitar2> solicitar2id_oferenteNavigations { get; set; } = new List<solicitar2>();

    public virtual ICollection<solicitar2> solicitar2id_usuarioNavigations { get; set; } = new List<solicitar2>();

    public virtual ICollection<telefono> telefonos { get; set; } = new List<telefono>();

    public virtual ICollection<valorar> valorars { get; set; } = new List<valorar>();

    public virtual ICollection<ventum> ventumid_clienteNavigations { get; set; } = new List<ventum>();

    public virtual ICollection<ventum> ventumid_vendedorNavigations { get; set; } = new List<ventum>();

    public virtual ICollection<direccion> id_direccions { get; set; } = new List<direccion>();

    public virtual ICollection<empresa> id_empresas { get; set; } = new List<empresa>();
}
